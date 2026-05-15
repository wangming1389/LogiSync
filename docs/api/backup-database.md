# Database Backup & Recovery Strategy

## 1. Overview
The LogiSync platform employs a hybrid backup strategy combining **Daily Snapshots** and **WAL (Write-Ahead Logging) Archiving** to achieve high availability and data durability.

## 2. Backup Strategy

### 2.1 Daily Snapshots (Full Backup)
Performed via the `DatabaseBackupService` at `apps/api/src/core/workers/database-backup.service.ts`.
- **Tool**: `pg_dump` with custom format (`-Fc`).
- **Schedule**: Every day at 3:00 AM UTC.
- **Storage**: Uploaded to a dedicated MinIO bucket (`logisync-backups`).
- **Retention**: Configurable (default: 7 days). Old snapshots are automatically purged.
- **Compression**: Gzip level 6 applied before upload.

### 2.2 WAL Archiving (Point-in-Time Recovery)
- **Mechanism**: Continuous archiving of PostgreSQL WAL segments.
- **RPO (Recovery Point Objective)**: ≈ 0 (Minimal data loss in case of disaster).
- **RTO (Recovery Time Objective)**: < 24 hours (Depends on snapshot size and WAL volume to replay).

## 3. Recovery Procedures

### 3.1 Restoring from Snapshot
1. Download the latest `.dump.gz` from MinIO.
2. Decompress: `gunzip backup.dump.gz`.
3. Restore: `pg_restore -d logisync backup.dump`.

### 3.2 Point-in-Time Recovery (PITR)
1. Restore the base snapshot.
2. Configure `recovery.conf` (or `postgresql.auto.conf` in PG 12+) to fetch WAL segments from the MinIO archive.
3. Start PostgreSQL and wait for WAL replay to complete.

## 4. Technical Constraints
- **Resource Usage**: `pg_dump` is limited to 512MB buffer to prevent OOM on the API container.
- **Security**: The backup bucket is private. Access relies on MinIO root credentials.
- **Monitoring**: Failures are logged to the `audit_logs` and reported via the `BackgroundWorkersService`.
