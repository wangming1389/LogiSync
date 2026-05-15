CREATE OR REPLACE FUNCTION prevent_order_status_history_manipulation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Order status history is append-only. UPDATE and DELETE are forbidden.';
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
DROP TRIGGER IF EXISTS order_status_history_append_only ON order_status_history;--> statement-breakpoint
CREATE TRIGGER order_status_history_append_only
	BEFORE UPDATE OR DELETE ON order_status_history
	FOR EACH ROW
	EXECUTE FUNCTION prevent_order_status_history_manipulation();
