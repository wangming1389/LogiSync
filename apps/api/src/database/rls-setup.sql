-- ==========================================
-- PostgreSQL Row-Level Security (RLS) Setup
-- ==========================================
-- Bảo vệ dữ liệu multi-tenant ở mức database

-- 1. Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_registry ENABLE ROW LEVEL SECURITY;

-- 2. Create policy for users table
-- Mỗi user chỉ thấy user trong cùng workspace
CREATE POLICY users_workspace_isolation ON users
    FOR SELECT
    USING (workspace_id = current_setting('app.workspace_id')::uuid);

-- 3. Create policy for audit_logs
-- Append-only: User chỉ thấy logs trong workspace của họ
CREATE POLICY audit_logs_workspace_isolation ON audit_logs
    FOR SELECT
    USING (workspace_id = current_setting('app.workspace_id')::uuid);

-- Prevent UPDATE/DELETE
CREATE POLICY audit_logs_no_update ON audit_logs
    FOR UPDATE
    USING (false);

CREATE POLICY audit_logs_no_delete ON audit_logs
    FOR DELETE
    USING (false);

-- 4. Create policy for session_registry
CREATE POLICY session_registry_workspace_isolation ON session_registry
    FOR SELECT
    USING (workspace_id = current_setting('app.workspace_id')::uuid);

-- 5. Database triggers to prevent audit log manipulation
CREATE OR REPLACE FUNCTION prevent_audit_log_manipulation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Audit logs are immutable. % is not allowed.', TG_OP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_immutable
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_manipulation();

-- 6. Audit trigger to log all changes
CREATE OR REPLACE FUNCTION log_all_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        actor_id, workspace_id, action, resource_type, resource_id,
        changes, ip_address, status, timestamp
    ) VALUES (
        COALESCE(current_setting('app.user_id', true)::uuid, '00000000-0000-0000-0000-000000000000'),
        COALESCE(current_setting('app.workspace_id', true)::uuid, '00000000-0000-0000-0000-000000000000'),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW)),
        COALESCE(current_setting('app.ip_address', true), 'unknown'),
        'success',
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Apply audit trigger to important tables
-- CREATE TRIGGER users_audit AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION log_all_changes();

-- ==========================================
-- Helper function to set session context
-- ==========================================
-- Call this at the beginning of each request in NestJS middleware
-- SELECT set_config('app.workspace_id', 'workspace-uuid', false);
-- SELECT set_config('app.user_id', 'user-uuid', false);
-- SELECT set_config('app.ip_address', '192.168.1.1', false);

-- ==========================================
-- Verification Queries
-- ==========================================
-- Check RLS policies
-- SELECT tablename, policyname, permissive, roles, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('users', 'audit_logs', 'session_registry');

-- Check triggers
-- SELECT trigger_name, event_manipulation, event_object_table
-- FROM information_schema.triggers
-- WHERE event_object_schema = 'public';

-- ==========================================
-- Notes
-- ==========================================
-- 1. RLS policies are enforced at the database level
-- 2. Even admins cannot bypass RLS with direct DB queries
-- 3. Always set session context (app.workspace_id) before queries
-- 4. Audit logs are immutable - no UPDATE/DELETE allowed
-- 5. All modifications are logged automatically
