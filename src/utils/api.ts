export interface TalentAccount {
  source: string;
  username: string;
  identifier: string;
}

export interface TalentProfile {
  talent_score: number;
  builder_score: number;
  accounts: TalentAccount[];
  passport_id?: string;
  user_id?: string;
  additional_scores?: Record<string, number>;
  rank_position?: number;
}

export interface TalentScore {
  points: number;
  slug: string;
  last_calculated_at: string;
}

export interface TalentAPIProfile {
  passport_id: string;
  passport_profile?: {
    bio?: string;
    image_url?: string;
    name?: string;
  };
  verified_wallets?: Array<{
    public_key: string;
  }>;
  verified_socials?: TalentAccount[];
  rank_position?: number;
  x_username?: string;
}

export interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
}

export interface NeynarSearchResult {
  users: NeynarUser[];
  result?: {
    users: NeynarUser[];
  };
}

export async function fetchTalentProfile(fid: string, _forceRefresh: boolean = false): Promise<TalentProfile | null> {
  try {
    const apiKey = import.meta.env.VITE_TALENT_API_KEY;

    if (!apiKey) {
      console.error('Talent API key is missing');
      return null;
    }

    const profileUrl = `https://api.talentprotocol.com/profile?id=${fid}&account_source=farcaster`;
    console.log('Fetching profile from:', profileUrl);

    const profileResponse = await fetch(profileUrl, {
      headers: {
        'X-API-KEY': apiKey,
      },
    });

    console.log('Profile response status:', profileResponse.status);

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Failed to fetch Talent Protocol profile', profileResponse.status, errorText);
      return null;
    }

    let profileData;
    try {
      profileData = await profileResponse.json();
      console.log('Profile data:', profileData);
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      const responseText = await profileResponse.text();
      console.error('Response was:', responseText);
      return null;
    }

    const profile = profileData.profile || profileData;

    if (!profile) {
      console.error('No profile data found');
      return null;
    }

    console.log('Profile structure:', {
      passport_id: profile.passport_id,
      user_id: profile.id,
      id: profile.id,
      user: profile.user,
      'profile.id': profile.id
    });

    const accounts = profile.accounts || [];

    // Add X account if x_username exists
    if (profile.x_username) {
      const xAccountExists = accounts.some(
        (acc: TalentAccount) => acc.source.toLowerCase() === 'x_twitter' || acc.source.toLowerCase() === 'twitter'
      );
      if (!xAccountExists) {
        accounts.push({
          source: 'x_twitter',
          username: profile.x_username,
          identifier: profile.x_username,
        });
      }
    }

    const scoresUrl = `https://api.talentprotocol.com/scores?id=${fid}&account_source=farcaster`;
    console.log('Fetching scores from:', scoresUrl);

    const scoresResponse = await fetch(scoresUrl, {
      headers: {
        'X-API-KEY': apiKey,
      },
    });

    let builderScore = 0;
    let talentScore = 0;
    const additionalScores: Record<string, number> = {};

    if (scoresResponse.ok) {
      try {
        const scoresData = await scoresResponse.json();
        console.log('Scores data:', scoresData);
        const scores: TalentScore[] = scoresData.scores || [];

        scores.forEach(score => {
          if (score.slug === 'builder_score') {
            builderScore = score.points;
          } else if (score.slug === 'talent_score') {
            talentScore = score.points;
          } else {
            additionalScores[score.slug] = score.points;
          }
        });
      } catch (jsonError) {
        console.error('Failed to parse scores JSON response:', jsonError);
      }
    } else {
      console.error('Failed to fetch scores', scoresResponse.status);
    }

    return {
      talent_score: talentScore,
      builder_score: builderScore,
      accounts: accounts,
      passport_id: profile.passport_id,
      user_id: profile.id,
      additional_scores: additionalScores,
      rank_position: profile.rank_position,
    };
  } catch (error) {
    console.error('Error fetching Talent Protocol profile:', error);
    return null;
  }
}

export async function searchNeynarUsers(query: string): Promise<NeynarUser[]> {
  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/search?q=${encodeURIComponent(query)}&limit=10`,
      {
        headers: {
          'api_key': import.meta.env.VITE_NEYNAR_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to search Neynar users');
      return [];
    }

    const data: NeynarSearchResult = await response.json();
    return data.result?.users || [];
  } catch (error) {
    console.error('Error searching Neynar users:', error);
    return [];
  }
}
