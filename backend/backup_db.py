import sqlite3
import json
import shutil
import os
from datetime import datetime

def backup():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    backups_dir = os.path.join(base_dir, "backups")
    os.makedirs(backups_dir, exist_ok=True)
    
    # Format with explicit today's date
    today_date = datetime.now().strftime("%Y_%m_%d")
    timestamp = datetime.now().strftime("%Y_%m_%d_%H%M%S")
    db_file = os.path.join(base_dir, "app.db")
    
    if not os.path.exists(db_file):
        print("No app.db found to backup!")
        return
        
    # 1. Copy SQLite .db file with date in filename
    backup_db_path = os.path.join(backups_dir, f"app_backup_{today_date}.db")
    backup_db_timestamped = os.path.join(backups_dir, f"app_backup_{timestamp}.db")
    latest_db_path = os.path.join(backups_dir, "app_backup_latest.db")
    
    shutil.copy(db_file, backup_db_path)
    shutil.copy(db_file, backup_db_timestamped)
    shutil.copy(db_file, latest_db_path)
    print(f"[OK] SQLite DB copied to: {backup_db_path}")

    # 2. Export all tables to readable JSON with date
    conn = sqlite3.connect(db_file)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence';")
    tables = [row[0] for row in cursor.fetchall()]

    data = {
        "backup_date": today_date,
        "backup_timestamp": str(datetime.now()),
        "tables": {}
    }

    for table in tables:
        cursor.execute(f"SELECT * FROM {table}")
        rows = [dict(row) for row in cursor.fetchall()]
        data["tables"][table] = rows
        print(f"[OK] Table '{table}': {len(rows)} records exported")

    json_backup_path = os.path.join(backups_dir, f"data_export_{today_date}.json")
    json_backup_timestamped = os.path.join(backups_dir, f"data_export_{timestamp}.json")
    latest_json_path = os.path.join(backups_dir, "data_export_latest.json")
    
    with open(json_backup_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    with open(json_backup_timestamped, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    with open(latest_json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"[OK] JSON data export created: {json_backup_path}")
    print(f"\n[SUCCESS] Backup completed successfully for date {today_date}!")

if __name__ == "__main__":
    backup()
