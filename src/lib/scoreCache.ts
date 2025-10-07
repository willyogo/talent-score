import { supabase } from './supabase';
import { TalentProfile } from '../utils/api';

const CACHE_EXPIRY_HOURS = 24;

export interface CachedScore {
  data: TalentProfile;
  isFromCache: boolean;
  lastRefreshed: string;
}

export async function getCachedScore(fid: string): Promise<CachedScore | null> {
  try {
    const { data, error } = await supabase
      .from('talent_scores')
      .select('*')
      .eq('fid', fid)
      .maybeSingle();

    if (error) {
      console.error('Error fetching cached score:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    const cacheAge = Date.now() - new Date(data.last_refreshed).getTime();
    const cacheAgeHours = cacheAge / (1000 * 60 * 60);

    if (cacheAgeHours > CACHE_EXPIRY_HOURS) {
      console.log('Cache expired for FID:', fid);
      return null;
    }

    return {
      data: {
        talent_score: data.talent_score,
        builder_score: data.builder_score,
        accounts: (data.accounts as any[]) || [],
        passport_id: data.passport_id || undefined,
        additional_scores: data.additional_scores as Record<string, number>,
        rank_position: data.rank_position || undefined,
      },
      isFromCache: true,
      lastRefreshed: data.last_refreshed,
    };
  } catch (error) {
    console.error('Error in getCachedScore:', error);
    return null;
  }
}

export async function saveScoreToCache(
  fid: string,
  profile: TalentProfile
): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from('talent_scores')
      .select('id')
      .eq('fid', fid)
      .maybeSingle();

    const scoreData = {
      fid,
      passport_id: profile.passport_id || null,
      talent_score: profile.talent_score,
      builder_score: profile.builder_score,
      accounts: profile.accounts || [],
      additional_scores: profile.additional_scores || {},
      rank_position: profile.rank_position || null,
      last_refreshed: new Date().toISOString(),
    };

    if (existing) {
      const { error } = await supabase
        .from('talent_scores')
        .update(scoreData)
        .eq('fid', fid);

      if (error) {
        console.error('Error updating cached score:', error);
      }
    } else {
      const { error } = await supabase
        .from('talent_scores')
        .insert({
          ...scoreData,
          cached_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error inserting cached score:', error);
      }
    }
  } catch (error) {
    console.error('Error in saveScoreToCache:', error);
  }
}

export async function getScoreWithCache(
  fid: string,
  fetchFn: (fid: string) => Promise<TalentProfile | null>,
  forceRefresh: boolean = false
): Promise<CachedScore | null> {
  if (!forceRefresh) {
    const cached = await getCachedScore(fid);
    if (cached) {
      console.log('Returning cached score for FID:', fid);
      return cached;
    }
  }

  console.log('Fetching fresh score for FID:', fid);
  const freshData = await fetchFn(fid);

  if (!freshData) {
    return null;
  }

  await saveScoreToCache(fid, freshData);

  return {
    data: freshData,
    isFromCache: false,
    lastRefreshed: new Date().toISOString(),
  };
}
