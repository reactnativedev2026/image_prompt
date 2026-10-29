"""Copy Cloudinary images from a JSON backup to S3 without changing the source backup.

Run without --apply to preview. With --apply, a new JSON file is written only
after every Cloudinary image has been copied (or found from a prior run).
"""

import argparse
import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen

from botocore.exceptions import ClientError

from app.config import settings
from app.services.s3 import get_s3_client, get_s3_url

KNOWN_MIGRATED_KEYS = {
    "https://res.cloudinary.com/kpoj1z5k/image/upload/v1785999790/ai_prompt_gallery/ni9dlchzdxzfxysjonzn.webp": (
        "ai_prompt_gallery/cloudinary-migration-2026-10-29/ni9dlchzdxzfxysjonzn.webp"
    ),
}


def migration_key(source_url: str) -> str:
    if source_url in KNOWN_MIGRATED_KEYS:
        return KNOWN_MIGRATED_KEYS[source_url]
    digest = hashlib.sha256(source_url.encode("utf-8")).hexdigest()
    return f"ai_prompt_gallery/cloudinary-migration-2026-10-29/{digest}.webp"


def fetch_image(source_url: str) -> tuple[bytes, str]:
    request = Request(source_url, headers={"User-Agent": "PromptTrending-S3-Migration/1.0"})
    with urlopen(request, timeout=60) as response:
        content_type = response.headers.get_content_type() or "image/webp"
        return response.read(), content_type


def upload_if_missing(client, key: str, image: bytes, content_type: str) -> None:
    try:
        client.put_object(
            Bucket=settings.AWS_S3_BUCKET_NAME,
            Key=key,
            Body=image,
            ContentType=content_type,
            IfNoneMatch="*",  # Never overwrite an existing object.
        )
    except ClientError as error:
        code = error.response.get("Error", {}).get("Code", "")
        if code not in {"PreconditionFailed", "412"}:
            raise


def main() -> None:
    parser = argparse.ArgumentParser(description="Copy Cloudinary backup images to S3 safely.")
    parser.add_argument("--backup", type=Path, required=True, help="Source JSON backup (never modified).")
    parser.add_argument("--output", type=Path, required=True, help="New JSON file to create with S3 URLs.")
    parser.add_argument("--apply", action="store_true", help="Download/upload images and create output JSON.")
    args = parser.parse_args()

    if not args.backup.is_file():
        raise FileNotFoundError(f"Backup not found: {args.backup}")
    if args.output.exists():
        raise FileExistsError(f"Refusing to overwrite output file: {args.output}")

    data = json.loads(args.backup.read_text(encoding="utf-8"))
    prompts = data.get("tables", {}).get("prompts", [])
    source_urls = sorted({p["image_url"] for p in prompts if "cloudinary.com" in p.get("image_url", "")})
    print(f"Prompts: {len(prompts)} | unique Cloudinary images: {len(source_urls)}")
    if not args.apply:
        print("Dry run complete. Nothing was downloaded, uploaded, or changed.")
        return

    client = get_s3_client()
    replacements = {}
    failures = []
    for index, source_url in enumerate(source_urls, start=1):
        try:
            image, content_type = fetch_image(source_url)
            key = migration_key(source_url)
            upload_if_missing(client, key, image, content_type)
            replacements[source_url] = get_s3_url(key)
            print(f"[{index}/{len(source_urls)}] copied")
        except Exception as error:
            failures.append((source_url, str(error)))
            print(f"[{index}/{len(source_urls)}] FAILED: {error}")

    if failures:
        print(f"Migration stopped: {len(failures)} images failed; output JSON was not created.")
        raise SystemExit(1)

    for prompt in prompts:
        prompt["image_url"] = replacements.get(prompt.get("image_url"), prompt.get("image_url"))
    args.output.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Success: created {args.output} with {len(replacements)} S3 image URLs.")


if __name__ == "__main__":
    main()
