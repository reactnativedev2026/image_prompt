# Production backup runbook

New uploads are retained on the server by `app.services.local_backup`. Set
`MEDIA_BACKUP_DIR` to a persistent server directory that is outside the deployed
release folder, for example:

```env
MEDIA_BACKUP_DIR=/var/backups/prompt-backend/media_backup
```

Export the live configured database (not the local `app.db`) with:

```bash
./venv/bin/python export_live_backup.py --backup-dir /var/backups/prompt-backend/database
```

Add a daily cron entry with `crontab -e`:

```cron
15 2 * * * cd /var/www/prompt-backend/backend && ./venv/bin/python export_live_backup.py --backup-dir /var/backups/prompt-backend/database >> /var/backups/prompt-backend/backup.log 2>&1
```

The cron entry only creates new timestamped exports; it never removes prior
backups. Keep the `/var/backups/prompt-backend` directory on persistent storage.
