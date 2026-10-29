"""Create an S3-ready JSON backup from local media_backup image files.

Cloudinary prompts without a matching local file are omitted from the output;
the source backup is never changed. S3 writes are conditional and cannot
overwrite an existing object.
"""

import argparse
import hashlib
import json
import mimetypes
from pathlib import Path
from urllib.parse import urlparse

from botocore.exceptions import ClientError

from app.config import settings
from app.services.s3 import get_s3_client, get_s3_url


def s3_key(source_url: str) -> str:
    digest = hashlib.sha256(source_url.encode("utf-8")).hexdigest()
    suffix = Path(urlparse(source_url).path).suffix.lower() or ".webp"
    return f"ai_prompt_gallery/cloudinary-migration-2026-10-29/{digest}{suffix}"


def local_files_by_name(media_dir: Path) -> dict[str, Path]:
    files = {}
    for path in media_dir.rglob("*"):
        if path.is_file():
            files.setdefault(path.name, path)
    return files


def copy_if_missing(client, key: str, source: Path) -> None:
    content_type = mimetypes.guess_type(source.name)[0] or "application/octet-stream"
    try:
        client.put_object(
            Bucket=settings.AWS_S3_BUCKET_NAME,
            Key=key,
            Body=source.read_bytes(),
            ContentType=content_type,
            IfNoneMatch="*",
        )
    except ClientError as error:
        if error.response.get("Error", {}).get("Code", "") not in {"PreconditionFailed", "412"}:
            raise


def main() -> None:
    parser = argparse.ArgumentParser(description="Migrate local image backups to S3 safely.")
    parser.add_argument("--backup", type=Path, required=True)
    parser.add_argument("--media-dir", type=Path, default=Path("media_backup"))
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    if not args.backup.is_file():
        raise FileNotFoundError(f"Backup not found: {args.backup}")
    if not args.media_dir.is_dir():
        raise FileNotFoundError(f"Media backup directory not found: {args.media_dir}")
    if args.output.exists():
        raise FileExistsError(f"Refusing to overwrite output file: {args.output}")

    data = json.loads(args.backup.read_text(encoding="utf-8"))
    prompts = data.get("tables", {}).get("prompts", [])
    local_files = local_files_by_name(args.media_dir)
    cloud_prompts = [p for p in prompts if "cloudinary.com" in p.get("image_url", "")]
    matched = [p for p in cloud_prompts if Path(urlparse(p["image_url"]).path).name in local_files]
    skipped = len(cloud_prompts) - len(matched)
    print(f"Prompts: {len(prompts)} | local Cloudinary matches: {len(matched)} | skipped: {skipped}")
    if not args.apply:
        print("Dry run complete. Nothing was uploaded or changed.")
        return

    client = get_s3_client()
    replacements = {}
    for index, prompt in enumerate(matched, start=1):
        source_url = prompt["image_url"]
        if source_url in replacements:
            continue
        source_file = local_files[Path(urlparse(source_url).path).name]
        key = s3_key(source_url)
        copy_if_missing(client, key, source_file)
        replacements[source_url] = get_s3_url(key)
        print(f"[{index}/{len(matched)}] copied")

    output_prompts = []
    for prompt in prompts:
        source_url = prompt.get("image_url", "")
        if "cloudinary.com" in source_url and source_url not in replacements:
            continue
        prompt["image_url"] = replacements.get(source_url, source_url)
        output_prompts.append(prompt)
    data["tables"]["prompts"] = output_prompts
    args.output.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Success: created {args.output} with {len(output_prompts)} prompts and {len(replacements)} S3 URLs.")


if __name__ == "__main__":
    main()
