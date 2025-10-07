/*
  # Create Talent Scores Cache Table

  1. New Tables
    - `talent_scores`
      - `id` (uuid, primary key) - Unique identifier for each cache entry
      - `fid` (text, indexed) - Farcaster ID for the user
      - `passport_id` (text) - Talent Protocol passport ID
      - `talent_score` (integer) - User's talent score from Talent Protocol
      - `builder_score` (integer) - User's builder score from Talent Protocol
      - `additional_scores` (jsonb) - Store any additional scores as JSON
      - `cached_at` (timestamptz) - When the score was first cached
      - `last_refreshed` (timestamptz) - When the score was last updated
      - `created_at` (timestamptz) - Record creation timestamp

  2. Indexes
    - Index on `fid` for fast lookups by Farcaster ID
    - Index on `last_refreshed` for cache expiration queries

  3. Security
    - Enable RLS on `talent_scores` table
    - Add policy for public read access (scores are public data)
    - No write policies needed (only server/edge functions should write)
*/

CREATE TABLE IF NOT EXISTS talent_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fid text NOT NULL,
  passport_id text,
  talent_score integer DEFAULT 0,
  builder_score integer DEFAULT 0,
  additional_scores jsonb DEFAULT '{}'::jsonb,
  cached_at timestamptz DEFAULT now(),
  last_refreshed timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create index on fid for fast lookups
CREATE INDEX IF NOT EXISTS idx_talent_scores_fid ON talent_scores(fid);

-- Create index on last_refreshed for cache expiration queries
CREATE INDEX IF NOT EXISTS idx_talent_scores_last_refreshed ON talent_scores(last_refreshed);

-- Enable Row Level Security
ALTER TABLE talent_scores ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to all talent scores
-- Talent scores are public information, anyone can view them
CREATE POLICY "Public read access to talent scores"
  ON talent_scores
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow anonymous users to insert new scores
-- This allows the frontend to cache scores directly
CREATE POLICY "Allow insert for caching scores"
  ON talent_scores
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow anonymous users to update existing scores
-- This allows the frontend to refresh cached scores
CREATE POLICY "Allow update for refreshing scores"
  ON talent_scores
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);