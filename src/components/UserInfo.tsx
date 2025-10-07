import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Twitter, Github, Globe, Linkedin, RefreshCw } from 'lucide-react';
import { fetchTalentProfile, TalentProfile, TalentAccount } from '../utils/api';
import { getScoreWithCache } from '../lib/scoreCache';

const getLinkIcon = (source: string) => {
  const lowerSource = source.toLowerCase();
  if (lowerSource === 'x_twitter' || lowerSource === 'twitter') {
    return Twitter;
  }
  if (lowerSource === 'github') {
    return Github;
  }
  if (lowerSource === 'linkedin') {
    return Linkedin;
  }
  return Globe;
};

const getAccountUrl = (account: TalentAccount): string => {
  const { source, username, identifier } = account;

  switch (source.toLowerCase()) {
    case 'x_twitter':
    case 'twitter':
      return `https://x.com/${username}`;
    case 'github':
      return `https://github.com/${username}`;
    case 'linkedin':
      return `https://www.linkedin.com/in/${username}`;
    case 'lens':
      return `https://hey.xyz/u/${username}`;
    case 'farcaster':
      return `https://warpcast.com/${username}`;
    case 'wallet':
      return `https://etherscan.io/address/${identifier}`;
    default:
      return '#';
  }
};

export default function UserInfo() {
  const { fid } = useParams<{ fid: string }>();
  const [searchParams] = useSearchParams();
  const isDarkMode = searchParams.get('dark') === 'true';
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadProfile = async (forceRefresh: boolean = false) => {
    if (!fid) return;

    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(false);

    const result = await getScoreWithCache(
      fid,
      (id) => fetchTalentProfile(id, forceRefresh),
      forceRefresh
    );

    if (result) {
      setProfile(result.data);
      setIsFromCache(result.isFromCache);
      setLastRefreshed(result.lastRefreshed);
    } else {
      setError(true);
    }

    setLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadProfile();
  }, [fid]);

  const handleRefresh = () => {
    loadProfile(true);
  };

  const bgClass = isDarkMode
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
    : 'bg-gradient-to-br from-slate-50 via-white to-slate-100';
  const textClass = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const cardBgClass = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const cardTextClass = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const hoverCardClass = isDarkMode ? 'hover:bg-slate-700 hover:border-slate-600' : 'hover:bg-slate-50 hover:border-slate-300';

  if (loading) {
    return (
      <div className={`w-full min-h-screen ${bgClass} flex items-center justify-center`}>
        <div className={textClass}>Loading...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`w-full min-h-screen ${bgClass} flex items-center justify-center`}>
        <div className={textClass}>Profile not found</div>
      </div>
    );
  }

  const displayAccounts = profile.accounts.filter(
    account => ['x_twitter', 'twitter', 'github', 'linkedin', 'lens'].includes(account.source.toLowerCase())
  );

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatScoreName = (slug: string): string => {
    return slug
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getScoreColor = (slug: string): string => {
    if (isDarkMode) {
      const colorMap: Record<string, string> = {
        builder_score: 'text-emerald-400',
        talent_score: 'text-blue-400',
        creator_score: 'text-amber-400',
        base_builder_score: 'text-sky-400',
        base200_score: 'text-violet-400',
        rank_position: 'text-pink-400',
      };
      return colorMap[slug] || 'text-slate-300';
    } else {
      const colorMap: Record<string, string> = {
        builder_score: 'text-emerald-600',
        talent_score: 'text-blue-600',
        creator_score: 'text-amber-600',
        base_builder_score: 'text-sky-600',
        base200_score: 'text-violet-600',
        rank_position: 'text-pink-600',
      };
      return colorMap[slug] || 'text-slate-700';
    }
  };

  const creatorScore = profile.additional_scores?.creator_score;

  const allScores = [
    ...(profile.builder_score > 0 ? [{ slug: 'builder_score', points: profile.builder_score }] : []),
    ...(profile.talent_score > 0 ? [{ slug: 'talent_score', points: profile.talent_score }] : []),
    ...(creatorScore ? [{ slug: 'creator_score', points: creatorScore }] : []),
    ...(profile.rank_position ? [{ slug: 'rank_position', points: profile.rank_position }] : []),
    ...Object.entries(profile.additional_scores || {})
      .filter(([slug]) => slug !== 'base_builder_score' && slug !== 'base200_score' && slug !== 'creator_score')
      .map(([slug, points]) => ({ slug, points })),
  ];

  const iconColorClass = isDarkMode ? 'text-slate-400 group-hover:text-blue-400' : 'text-slate-500 group-hover:text-blue-600';
  const linkHoverClass = isDarkMode ? 'hover:text-slate-300' : 'hover:text-slate-700';
  const refreshBgClass = isDarkMode ? 'bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 border-slate-700' : 'bg-white hover:bg-slate-50 disabled:bg-slate-100 border-slate-300';
  const refreshTextClass = isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-700';

  return (
    <div className={`w-full min-h-screen ${bgClass} p-4 flex items-center justify-center`}>
      <div className="w-full max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {allScores.map((score) => (
              <div
                key={score.slug}
                className={`flex flex-col items-center justify-center ${cardBgClass} rounded-lg px-4 py-3 border`}
              >
                <div className={`text-xs ${cardTextClass} uppercase tracking-wide mb-1 text-center`}>
                  {formatScoreName(score.slug)}
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(score.slug)}`}>
                  {score.points}
                </div>
              </div>
            ))}
          </div>

          {displayAccounts.length > 0 && (
            <div className="flex gap-2 justify-center">
              {displayAccounts.slice(0, 4).map((account, index) => {
                const Icon = getLinkIcon(account.source);
                const url = getAccountUrl(account);
                return (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 ${cardBgClass} rounded-lg flex items-center justify-center ${hoverCardClass} transition-all group border`}
                    title={`${account.source}: ${account.username}`}
                  >
                    <Icon className={`w-4 h-4 ${iconColorClass} transition-colors`} />
                  </a>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <a
              href={`https://app.talentprotocol.com/${profile.passport_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 ${textClass} ${linkHoverClass} transition-colors`}
            >
              <span className="text-xs">Powered by</span>
              <img
                src={isDarkMode ? "/image.png" : "/talent protocol logo.png"}
                alt="Talent Protocol"
                className="h-4"
              />
            </a>

            {isFromCache && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 ${refreshBgClass} ${refreshTextClass} text-xs rounded border transition-colors disabled:cursor-not-allowed`}
                title={`Cached ${formatTimeAgo(lastRefreshed)}`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
