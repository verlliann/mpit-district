# Backup & Recovery

## PostgreSQL Backup

### Automated Backups

```bash
# Daily backup script
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="aidb"

pg_dump -h postgres -U aiuser -d $DB_NAME | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### WAL Archiving

```bash
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /wal_archive/%f && cp %p /wal_archive/%f'
```

---

## Recovery

```bash
# Restore from backup
gunzip -c backup_20251212.sql.gz | psql -h postgres -U aiuser -d aidb
```

---

## Disaster Recovery Plan

**RTO (Recovery Time Objective):** ≤ 1 hour  
**RPO (Recovery Point Objective):** ≤ 5 minutes

1. **Automated daily backups** to S3
2. **Continuous WAL archiving**
3. **Regular restore testing** (monthly)
4. **Multi-region replication** (production)

---

**См. также:**
- [Database Schema](../database/schema.md)
- [Kubernetes](./kubernetes.md)

