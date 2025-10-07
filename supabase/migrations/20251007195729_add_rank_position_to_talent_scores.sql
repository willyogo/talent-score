/*
  # Add rank_position column to talent_scores table

  1. Changes
    - Add `rank_position` column to store user's rank position (integer type)
    - Set default value to null for existing records
  
  2. Notes
    - This column will store the user's rank position from the Talent Protocol API
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'talent_scores' AND column_name = 'rank_position'
  ) THEN
    ALTER TABLE talent_scores ADD COLUMN rank_position integer;
  END IF;
END $$;
