-- ==========================================================
-- 1. THIẾT LẬP TÍNH BẤT BIẾN CHO AUDIT LOGS (IMMUTABILITY)
-- ==========================================================
-- Để đảm bảo bảng audit_logs không bao giờ bị sửa hay xóa dữ liệu.

CREATE OR REPLACE FUNCTION prevent_audit_log_manipulation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable. % operation is forbidden.', TG_OP;
END;
$$ LANGUAGE plpgsql;

-- Kích hoạt trigger cho bảng audit_logs
DROP TRIGGER IF EXISTS audit_logs_immutable ON audit_logs;
CREATE TRIGGER audit_logs_immutable
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_manipulation();


-- ==========================================================
-- 2. ĐẢM BẢO RLS LUÔN TẮT (SECURITY OVERRIDE)
-- ==========================================================
-- Đảm bảo tất cả các bảng Multi-tenant không bị vướng RLS 
-- Để NestJS toàn quyền kiểm soát qua câu lệnh .where()

ALTER TABLE IF EXISTS "users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "audit_logs" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "session_registry" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "supplier_categories" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "products" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "rfqs" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "quotations" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "purchase_orders" DISABLE ROW LEVEL SECURITY;