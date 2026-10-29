"""Export the currently configured live database to a timestamped JSON file."""

import argparse
import json
from datetime import datetime
from pathlib import Path

from app.database import SessionLocal
from app.models import Admin, Category, Prompt


def serialise(value):
    return value.isoformat(sep=" ") if isinstance(value, datetime) else value


def rows(items, fields):
    return [{field: serialise(getattr(item, field)) for field in fields} for item in items]


def main() -> None:
    parser = argparse.ArgumentParser(description="Export the configured live Prompt Trending database.")
    parser.add_argument("--backup-dir", type=Path, default=Path("backups"))
    args = parser.parse_args()

    args.backup_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y_%m_%d_%H%M%S")
    output = args.backup_dir / f"live_data_export_{timestamp}.json"
    if output.exists():
        raise FileExistsError(f"Refusing to overwrite existing backup: {output}")

    db = SessionLocal()
    try:
        data = {
            "backup_date": datetime.now().strftime("%Y_%m_%d"),
            "backup_timestamp": str(datetime.now()),
            "tables": {
                "admins": rows(db.query(Admin).order_by(Admin.id).all(), ["id", "username", "password_hash", "created_at"]),
                "categories": rows(db.query(Category).order_by(Category.id).all(), ["id", "name", "created_at"]),
                "prompts": rows(db.query(Prompt).order_by(Prompt.id).all(), [
                    "id", "image_url", "prompt_text", "is_trending", "view_count", "copy_count",
                    "favorite_count", "created_at", "category_id",
                ]),
            },
        }
    finally:
        db.close()

    output.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Created {output}")
    print("Records: " + ", ".join(f"{name}={len(items)}" for name, items in data["tables"].items()))


if __name__ == "__main__":
    main()
