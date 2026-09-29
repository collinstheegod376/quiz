-- QUIZ//ARENA: Realtime Rooms Table
-- Run this in your Supabase SQL Editor
-- This is a simple, flat rooms table using JSONB state for easy Realtime sync

-- Create the new flat realtime_rooms table
CREATE TABLE IF NOT EXISTS realtime_rooms (
  code        VARCHAR(6) PRIMARY KEY,
  state       JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by code
CREATE INDEX IF NOT EXISTS idx_realtime_rooms_code ON realtime_rooms(code);

-- Enable Row Level Security
ALTER TABLE realtime_rooms ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rooms (needed for joining by code)
CREATE POLICY "Anyone can read rooms" ON realtime_rooms
  FOR SELECT USING (true);

-- Allow anyone to insert rooms (host creates room)
CREATE POLICY "Anyone can create rooms" ON realtime_rooms
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update rooms (players join, game progresses)
CREATE POLICY "Anyone can update rooms" ON realtime_rooms
  FOR UPDATE USING (true);

-- Allow anyone to delete rooms (host ends game)
CREATE POLICY "Anyone can delete rooms" ON realtime_rooms
  FOR DELETE USING (true);

-- Enable Realtime on this table
ALTER PUBLICATION supabase_realtime ADD TABLE realtime_rooms;
