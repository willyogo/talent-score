import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface TalentScoreCache {
  id: string;
  fid: string;
  passport_id: string | null;
  talent_score: number;
  builder_score: number;
  additional_scores: Record<string, number>;
  cached_at: string;
  last_refreshed: string;
  created_at: string;
}
