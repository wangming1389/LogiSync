-- ==========================================================
-- Append-only protection for negotiation_rounds
-- ==========================================================
-- Negotiation rounds are an immutable legal record (UC30, BR-206).
-- DELETE is forbidden outright.
-- UPDATE is forbidden except for finalizing acceptance: flipping `is_accepted`
--   from FALSE to TRUE via the accept-round endpoint, with no other column change.
-- All historical fields (role, proposed_price, proposed_delivery_days, note,
-- submitted_by, submitted_at) are immutable once inserted.

CREATE OR REPLACE FUNCTION prevent_negotiation_round_manipulation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Negotiation rounds are append-only. DELETE is forbidden.';
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.id IS DISTINCT FROM NEW.id
           OR OLD.quotation_id IS DISTINCT FROM NEW.quotation_id
           OR OLD.role IS DISTINCT FROM NEW.role
           OR OLD.proposed_price IS DISTINCT FROM NEW.proposed_price
           OR OLD.proposed_delivery_days IS DISTINCT FROM NEW.proposed_delivery_days
           OR OLD.note IS DISTINCT FROM NEW.note
           OR OLD.submitted_by IS DISTINCT FROM NEW.submitted_by
           OR OLD.submitted_at IS DISTINCT FROM NEW.submitted_at THEN
            RAISE EXCEPTION 'Negotiation rounds are append-only. Only is_accepted can be updated.';
        END IF;

        IF OLD.is_accepted = TRUE AND NEW.is_accepted = FALSE THEN
            RAISE EXCEPTION 'is_accepted can only flip false -> true.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS negotiation_rounds_append_only ON negotiation_rounds;
CREATE TRIGGER negotiation_rounds_append_only
    BEFORE UPDATE OR DELETE ON negotiation_rounds
    FOR EACH ROW
    EXECUTE FUNCTION prevent_negotiation_round_manipulation();

-- ==========================================================
-- Disable RLS on the new sourcing table (NestJS owns access via .where())
-- ==========================================================
ALTER TABLE IF EXISTS "negotiation_rounds" DISABLE ROW LEVEL SECURITY;