#!/bin/bash
# ============================================================================
# WAL Archive Script - Đẩy PostgreSQL WAL segments lên MinIO
# ============================================================================
#
# Script này được gọi bởi PostgreSQL thông qua archive_command.
# Mỗi khi một WAL segment (16MB) được ghi đầy hoặc archive_timeout hết hạn,
# PostgreSQL sẽ gọi script này để archive WAL file.
#
# Usage (trong postgresql.conf):
#   archive_command = '/scripts/wal-archive.sh %p %f'
#   - %p = đường dẫn đầy đủ đến WAL file
#   - %f = tên WAL file (ví dụ: 000000010000000000000001)
#
# Yêu cầu:
#   - curl phải được cài trong PostgreSQL container
#   - Biến môi trường: MINIO_ENDPOINT, MINIO_ROOT_USER, MINIO_ROOT_PASSWORD,
#     BACKUP_BUCKET_NAME
#
# Exit code:
#   0 = thành công (PostgreSQL sẽ xóa WAL file khỏi pg_wal/)
#   1 = thất bại (PostgreSQL sẽ retry lần sau)
# ============================================================================

set -euo pipefail

WAL_FILE_PATH="$1"    # Đường dẫn đầy đủ (%p)
WAL_FILE_NAME="$2"    # Tên file (%f)

MINIO_HOST="${MINIO_ENDPOINT:-minio}"
MINIO_PORT="${MINIO_API_PORT:-9000}"
MINIO_ACCESS_KEY="${MINIO_ROOT_USER:-minioadmin}"
MINIO_SECRET_KEY="${MINIO_ROOT_PASSWORD:-minioadmin}"
MINIO_USE_SSL="${MINIO_USE_SSL:-false}"
BUCKET="${BACKUP_BUCKET_NAME:-logisync-backups}"
OBJECT_PATH="wal-archive/${WAL_FILE_NAME}"

# Xác định protocol
if [ "$MINIO_USE_SSL" = "true" ]; then
    PROTOCOL="https"
else
    PROTOCOL="http"
fi

MINIO_URL="${PROTOCOL}://${MINIO_HOST}:${MINIO_PORT}"

# Đường dẫn local fallback nếu MinIO không available
LOCAL_WAL_BACKUP_DIR="/var/lib/postgresql/wal-archive"

# ─── Logging helper ────
log_info() {
    echo "[WAL-ARCHIVE] $(date '+%Y-%m-%d %H:%M:%S') INFO: $*"
}

log_error() {
    echo "[WAL-ARCHIVE] $(date '+%Y-%m-%d %H:%M:%S') ERROR: $*" >&2
}

# ─── S3 Signature V4 helpers ────
# MinIO sử dụng AWS S3 Signature V4 cho authentication.
# Để đơn giản, ta dùng curl với mc (MinIO Client) nếu có,
# hoặc fallback sang unsigned upload nếu bucket policy cho phép.

upload_to_minio() {
    local file_path="$1"
    local object_key="$2"

    # Thử dùng MinIO Client (mc) nếu đã được cài sẵn
    if command -v mc &> /dev/null; then
        # Cấu hình mc alias (idempotent)
        mc alias set walbackup "${MINIO_URL}" "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}" --api S3v4 2>/dev/null

        # Đảm bảo bucket tồn tại
        mc mb --ignore-existing "walbackup/${BUCKET}" 2>/dev/null || true

        # Upload WAL file
        mc cp "${file_path}" "walbackup/${BUCKET}/${object_key}"
        return $?
    fi

    # Fallback: dùng curl với AWS Signature V4
    # Tính toán S3 signature
    local date_iso
    date_iso=$(date -u +"%Y%m%dT%H%M%SZ")
    local date_short
    date_short=$(date -u +"%Y%m%d")
    local region="us-east-1"
    local service="s3"
    local content_hash
    content_hash=$(sha256sum "${file_path}" | cut -d' ' -f1)

    local canonical_uri="/${BUCKET}/${object_key}"
    local canonical_querystring=""
    local canonical_headers="host:${MINIO_HOST}:${MINIO_PORT}\nx-amz-content-sha256:${content_hash}\nx-amz-date:${date_iso}\n"
    local signed_headers="host;x-amz-content-sha256;x-amz-date"

    local canonical_request="PUT\n${canonical_uri}\n${canonical_querystring}\n${canonical_headers}\n${signed_headers}\n${content_hash}"
    local canonical_request_hash
    canonical_request_hash=$(printf '%b' "${canonical_request}" | sha256sum | cut -d' ' -f1)

    local credential_scope="${date_short}/${region}/${service}/aws4_request"
    local string_to_sign="AWS4-HMAC-SHA256\n${date_iso}\n${credential_scope}\n${canonical_request_hash}"

    # HMAC-SHA256 signing
    local k_date
    k_date=$(printf '%s' "${date_short}" | openssl dgst -sha256 -hmac "AWS4${MINIO_SECRET_KEY}" -binary | xxd -p -c 256)
    local k_region
    k_region=$(printf '%s' "${region}" | openssl dgst -sha256 -mac HMAC -macopt "hexkey:${k_date}" -binary | xxd -p -c 256)
    local k_service
    k_service=$(printf '%s' "${service}" | openssl dgst -sha256 -mac HMAC -macopt "hexkey:${k_region}" -binary | xxd -p -c 256)
    local k_signing
    k_signing=$(printf '%s' "aws4_request" | openssl dgst -sha256 -mac HMAC -macopt "hexkey:${k_service}" -binary | xxd -p -c 256)

    local signature
    signature=$(printf '%b' "${string_to_sign}" | openssl dgst -sha256 -mac HMAC -macopt "hexkey:${k_signing}" -binary | xxd -p -c 256)

    local authorization="AWS4-HMAC-SHA256 Credential=${MINIO_ACCESS_KEY}/${credential_scope}, SignedHeaders=${signed_headers}, Signature=${signature}"

    curl -sf -X PUT \
        -H "Authorization: ${authorization}" \
        -H "x-amz-content-sha256: ${content_hash}" \
        -H "x-amz-date: ${date_iso}" \
        -H "Content-Type: application/octet-stream" \
        -T "${file_path}" \
        "${MINIO_URL}${canonical_uri}"

    return $?
}

# ─── Main ────

# Kiểm tra WAL file tồn tại
if [ ! -f "${WAL_FILE_PATH}" ]; then
    log_error "WAL file not found: ${WAL_FILE_PATH}"
    exit 1
fi

WAL_SIZE=$(stat -c%s "${WAL_FILE_PATH}" 2>/dev/null || stat -f%z "${WAL_FILE_PATH}" 2>/dev/null || echo "unknown")
log_info "Archiving WAL: ${WAL_FILE_NAME} (${WAL_SIZE} bytes) → ${BUCKET}/${OBJECT_PATH}"

# Thử upload lên MinIO
if upload_to_minio "${WAL_FILE_PATH}" "${OBJECT_PATH}"; then
    log_info "✅ WAL archived successfully: ${WAL_FILE_NAME}"
    exit 0
fi

# Nếu MinIO fail → fallback lưu local
log_error "MinIO upload failed, falling back to local archive"

mkdir -p "${LOCAL_WAL_BACKUP_DIR}"

if cp "${WAL_FILE_PATH}" "${LOCAL_WAL_BACKUP_DIR}/${WAL_FILE_NAME}"; then
    log_info "⚠️ WAL saved locally: ${LOCAL_WAL_BACKUP_DIR}/${WAL_FILE_NAME}"
    exit 0
else
    log_error "❌ Failed to archive WAL both to MinIO and locally!"
    exit 1
fi
