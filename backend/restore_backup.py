"""Safely import a JSON export into the configured database.

The default is a dry run. Use --apply only after reviewing the planned import.
Existing records are never updated or deleted.
"""

import argparse
import json
from datetime import datetime
from pathlib import Path

from app.database import SessionLocal
from app.models import Admin, Category, Prompt


DEFAULT_BACKUP = Path(__file__).parent / "backups" / "data_export_latest.json"
IMAGE_URL_REPLACEMENTS = {
    "https://res.cloudinary.com/kpoj1z5k/image/upload/v1785999790/ai_prompt_gallery/ni9dlchzdxzfxysjonzn.webp": (
        "https://2026promptbucket.s3.eu-north-1.amazonaws.com/"
        "ai_prompt_gallery/cloudinary-migration-2026-10-29/ni9dlchzdxzfxysjonzn.webp"
    ),
}


def parse_datetime(value):
    if not value:
        return None
    return datetime.fromisoformat(value)


def restore(backup_path: Path, apply: bool) -> None:
    with backup_path.open(encoding="utf-8") as backup_file:
        tables = json.load(backup_file).get("tables", {})

    admins = tables.get("admins", [])
    categories = tables.get("categories", [])
    prompts = tables.get("prompts", [])
    print(f"Backup contains: {len(admins)} admins, {len(categories)} categories, {len(prompts)} prompts")
    print("Mode: APPLY" if apply else "Mode: DRY RUN (nothing will be changed)")

    db = SessionLocal()
    try:
        category_ids = {}
        planned = {"admins": 0, "categories": 0, "prompts": 0, "skipped": 0}

        for record in admins:
            existing = db.get(Admin, record["id"])
            if existing or db.query(Admin).filter_by(username=record["username"]).first():
                planned["skipped"] += 1
                continue
            planned["admins"] += 1
            if apply:
                db.add(Admin(
                    id=record["id"], username=record["username"],
                    password_hash=record["password_hash"],
                    created_at=parse_datetime(record.get("created_at")),
                ))

        for record in categories:
            # Prefer an existing category with the same name. If only the old
            # numeric ID is occupied, create a new category ID instead.
            existing = db.query(Category).filter_by(name=record["name"]).first()
            if existing:
                category_ids[record["id"]] = existing.id
                planned["skipped"] += 1
                continue
            planned["categories"] += 1
            if apply:
                category = Category(name=record["name"], created_at=parse_datetime(record.get("created_at")))
                db.add(category)
                category_ids[record["id"]] = category

        if apply:
            db.flush()
            category_ids = {
                old_id: category.id if isinstance(category, Category) else category
                for old_id, category in category_ids.items()
            }

        for record in prompts:
            image_url = IMAGE_URL_REPLACEMENTS.get(record["image_url"], record["image_url"])
            existing = db.query(Prompt).filter_by(
                image_url=image_url, prompt_text=record["prompt_text"]
            ).first()
            if existing:
                planned["skipped"] += 1
                continue
            category_id = category_ids.get(record["category_id"])
            if apply and category_id is None:
                raise ValueError(f"Prompt {record['id']} has no imported category")
            planned["prompts"] += 1
            if apply:
                db.add(Prompt(
                    image_url=image_url, prompt_text=record["prompt_text"],
                    is_trending=bool(record.get("is_trending", False)),
                    view_count=record.get("view_count", 0), copy_count=record.get("copy_count", 0),
                    favorite_count=record.get("favorite_count", 0),
                    created_at=parse_datetime(record.get("created_at")), category_id=category_id,
                ))

        if apply:
            db.commit()
        print("Planned/imported: " + ", ".join(f"{key}={value}" for key, value in planned.items()))
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Safely restore a Prompt Trending JSON backup.")
    parser.add_argument("--backup", type=Path, default=DEFAULT_BACKUP)
    parser.add_argument("--apply", action="store_true", help="Perform the import; omit for a dry run.")
    args = parser.parse_args()
    restore(args.backup, args.apply)
