import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center ${classes.containerPadding}`}>
      <div className="w-full max-w-md mx-auto">
        <div className={`text-center ${classes.isCompact ? 'mb-4' : 'mb-8'}`}>
          <h1 className={`${classes.titleSize} font-bold text-white ${classes.isCompact ? 'mb-1' : 'mb-2'}`}>Talent Scores</h1>
          <p className={`text-slate-400 ${classes.bodySize} px-2`}>Search for Farcaster users to view their Talent Protocol scores</p>
        </div>

        <div className="relative" ref={resultsRef}>
          <div className="relative">
            <Search className={`absolute ${classes.isCompact ? 'left-2' : 'left-3'} top-1/2 transform -translate-y-1/2 text-slate-400 ${classes.searchIconSize}`} />
            <input
              type="text"
              placeholder="Search by username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
              className={`w-full ${classes.searchInputPadding} bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${classes.bodySize}`}
            />
          </div>

          {showResults && results.length > 0 && (
            <div className={`absolute w-full ${classes.isCompact ? 'mt-1' : 'mt-2'} bg-slate-800 border border-slate-700 rounded-lg shadow-xl ${classes.maxHeight} overflow-y-auto z-10`}>
              {results.map((user) => (
                <button
                  key={user.fid}
                  onClick={() => handleUserSelect(user.fid)}
                  className={`w-full flex items-center ${classes.gridGap} ${classes.cardPadding} hover:bg-slate-700 transition-colors text-left border-b border-slate-700 last:border-b-0`}
                >
                  <img
                    src={user.pfp_url}
                    alt={user.username}
                    className={`${classes.avatarSize} rounded-full flex-shrink-0`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-white font-medium truncate ${classes.bodySize}`}>{user.display_name}</div>
                    <div className={`text-slate-400 ${classes.subtitleSize}`}>@{user.username}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {isSearching && query.trim().length >= 2 && (
            <div className={`absolute w-full ${classes.isCompact ? 'mt-1' : 'mt-2'} bg-slate-800 border border-slate-700 rounded-lg shadow-xl ${classes.cardPadding} text-center text-slate-400 ${classes.bodySize}`}>
              Searching...
            </div>
          )}

          {showResults && !isSearching && query.trim().length >= 2 && results.length === 0 && (
            <div className={`absolute w-full ${classes.isCompact ? 'mt-1' : 'mt-2'} bg-slate-800 border border-slate-700 rounded-lg shadow-xl ${classes.cardPadding} text-center text-slate-400 ${classes.bodySize}`}>
              No users found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
