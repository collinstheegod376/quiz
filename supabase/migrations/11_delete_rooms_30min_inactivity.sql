-- ==============================================================================
-- MIGRATION 11: Auto-Delete Rooms After 30 Minutes of Inactivity
-- ==============================================================================

-- 1. Create cleanup function to delete rooms inactive for > 30 minutes
CREATE OR REPLACE FUNCTION delete_stale_rooms()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM realtime_rooms 
  WHERE updated_at < NOW() - INTERVAL '30 minutes' 
     OR state->>'status' = 'FINISHED';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Run once immediately
SELECT delete_stale_rooms();

-- 2. Optional pg_cron scheduling (runs every 5 minutes if pg_cron is enabled)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    BEGIN
      -- Unschedule previous schedule if present
      PERFORM cron.unschedule('cleanup-stale-rooms-30min');
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

    BEGIN
      PERFORM cron.schedule(
        'cleanup-stale-rooms-30min',
        '*/5 * * * *',
        'SELECT delete_stale_rooms()'
      );
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END $$;
