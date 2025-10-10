import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { searchNeynarUsers, NeynarUser } from '../utils/api';
import { useResponsiveClasses } from '../hooks/useResponsiveClasses';
import { useSimpleResponsive } from '../hooks/useSimpleResponsive';

export default function LandingPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NeynarUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDarkMode = searchParams.get('dark') === 'true';
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const responsiveClasses = useResponsiveClasses();
  const simpleResponsive = useSimpleResponsive();
  
  // Use simple responsive as fallback if iframe detection fails
  const classes = responsiveClasses.iframeWidth > 0 ? responsiveClasses : simpleResponsive;

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const users = await searchNeynarUsers(query);
      setResults(users);
      setShowResults(true);
      setIsSearching(false);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserSelect = (fid: number) => {
    navigate(`/${fid}`);
  };

  const bgClass = isDarkMode
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
    : 'bg-gradient-to-br from-slate-50 via-white to-slate-100';
  const textClass = isDarkMode ? 'text-white' : 'text-slate-900';
  const subtitleClass = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const inputBgClass = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300';
  const inputTextClass = isDarkMode ? 'text-white placeholder-slate-400' : 'text-slate-900 placeholder-slate-500';
  const dropdownBgClass = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300';
  const dropdownItemClass = isDarkMode ? 'hover:bg-slate-700 border-slate-700' : 'hover:bg-slate-50 border-slate-200';
  const dropdownTextClass = isDarkMode ? 'text-white' : 'text-slate-900';
  const dropdownSubtextClass = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`h-screen w-full ${bgClass} flex items-center justify-center ${classes.containerPadding}`}>
      <div className="w-full max-w-md mx-auto">
        <div className={`text-center ${classes.isCompact ? 'mb-4' : 'mb-8'}`}>
          <h1 className={`${classes.titleSize} font-bold ${textClass} ${classes.isCompact ? 'mb-1' : 'mb-2'}`}>Talent Scores</h1>
          <p className={`${subtitleClass} ${classes.bodySize} px-2`}>Search for Farcaster users to view their Talent Protocol scores</p>
        </div>

        <div className="relative" ref={resultsRef}>
          <div className="relative">
            <Search className={`absolute ${classes.isCompact ? 'left-2' : 'left-3'} top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} ${classes.searchIconSize}`} />
            <input
              type="text"
              placeholder="Search by username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
              className={`w-full ${classes.searchInputPadding} ${inputBgClass} border rounded-lg ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${classes.bodySize}`}
            />
          </div>

          {showResults && results.length > 0 && (
            <div className={`absolute w-full ${classes.isCompact ? 'mt-1' : 'mt-2'} ${dropdownBgClass} border rounded-lg shadow-xl ${classes.maxHeight} overflow-y-auto z-10`}>
              {results.map((user) => (
                <button
                  key={user.fid}
                  onClick={() => handleUserSelect(user.fid)}
                  className={`w-full flex items-center ${classes.gridGap} ${classes.cardPadding} ${dropdownItemClass} transition-colors text-left border-b last:border-b-0`}
                >
                  <img
                    src={user.pfp_url}
                    alt={user.username}
                    className={`${classes.avatarSize} rounded-full flex-shrink-0`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`${dropdownTextClass} font-medium truncate ${classes.bodySize}`}>{user.display_name}</div>
                    <div className={`${dropdownSubtextClass} ${classes.subtitleSize}`}>@{user.username}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {isSearching && query.trim().length >= 2 && (
            <div className={`absolute w-full ${classes.isCompact ? 'mt-1' : 'mt-2'} ${dropdownBgClass} border rounded-lg shadow-xl ${classes.cardPadding} text-center ${dropdownSubtextClass} ${classes.bodySize}`}>
              Searching...
            </div>
          )}

          {showResults && !isSearching && query.trim().length >= 2 && results.length === 0 && (
            <div className={`absolute w-full ${classes.isCompact ? 'mt-1' : 'mt-2'} ${dropdownBgClass} border rounded-lg shadow-xl ${classes.cardPadding} text-center ${dropdownSubtextClass} ${classes.bodySize}`}>
              No users found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
