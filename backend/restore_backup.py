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
            existing = db.get(Category, record["id"]) or db.query(Category).filter_by(name=record["name"]).first()
            if existing:
                category_ids[record["id"]] = existing.id
                planned["skipped"] += 1
                continue
            planned["categories"] += 1
            category_ids[record["id"]] = record["id"]
            if apply:
                db.add(Category(id=record["id"], name=record["name"], created_at=parse_datetime(record.get("created_at"))))

        if apply:
            db.flush()

        for record in prompts:
            if db.get(Prompt, record["id"]):
                planned["skipped"] += 1
                continue
            category_id = category_ids.get(record["category_id"], record["category_id"])
            category_exists = db.get(Category, category_id) if apply else any(
                item["id"] == record["category_id"] for item in categories
            )
            if not category_exists:
                print(f"Skipping prompt {record['id']}: category {record['category_id']} is unavailable")
                planned["skipped"] += 1
                continue
            planned["prompts"] += 1
            if apply:
                db.add(Prompt(
                    id=record["id"], image_url=record["image_url"], prompt_text=record["prompt_text"],
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
