/*
  # Add accounts column to talent_scores table

  1. Changes
    - Add `accounts` column to store social account information (jsonb type)
    - Set default value to empty array for existing records
  
  2. Notes
    - This column will store the user's connected social accounts
    - Data includes source, username, and identifier for each account
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'talent_scores' AND column_name = 'accounts'
  ) THEN
    ALTER TABLE talent_scores ADD COLUMN accounts jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
