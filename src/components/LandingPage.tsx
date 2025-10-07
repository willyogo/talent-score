import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { searchNeynarUsers, NeynarUser } from '../utils/api';
import { useResponsiveClasses } from '../hooks/useResponsiveClasses';

export default function LandingPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NeynarUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const responsiveClasses = useResponsiveClasses();

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
    <div className={`min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center ${responsiveClasses.containerPadding}`}>
      <div className="w-full max-w-md mx-auto">
        <div className={`text-center ${responsiveClasses.isCompact ? 'mb-4' : 'mb-8'}`}>
          <h1 className={`${responsiveClasses.titleSize} font-bold text-white ${responsiveClasses.isCompact ? 'mb-1' : 'mb-2'}`}>Talent Scores</h1>
          <p className={`text-slate-400 ${responsiveClasses.bodySize} px-2`}>Search for Farcaster users to view their Talent Protocol scores</p>
        </div>

        <div className="relative" ref={resultsRef}>
          <div className="relative">
            <Search className={`absolute ${responsiveClasses.isCompact ? 'left-2' : 'left-3'} top-1/2 transform -translate-y-1/2 text-slate-400 ${responsiveClasses.searchIconSize}`} />
            <input
              type="text"
              placeholder="Search by username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
              className={`w-full ${responsiveClasses.searchInputPadding} bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${responsiveClasses.bodySize}`}
            />
          </div>

          {showResults && results.length > 0 && (
            <div className={`absolute w-full ${responsiveClasses.isCompact ? 'mt-1' : 'mt-2'} bg-slate-800 border border-slate-700 rounded-lg shadow-xl ${responsiveClasses.maxHeight} overflow-y-auto z-10`}>
              {results.map((user) => (
                <button
                  key={user.fid}
                  onClick={() => handleUserSelect(user.fid)}
                  className={`w-full flex items-center ${responsiveClasses.gridGap} ${responsiveClasses.cardPadding} hover:bg-slate-700 transition-colors text-left border-b border-slate-700 last:border-b-0`}
                >
                  <img
                    src={user.pfp_url}
                    alt={user.username}
                    className={`${responsiveClasses.avatarSize} rounded-full flex-shrink-0`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-white font-medium truncate ${responsiveClasses.bodySize}`}>{user.display_name}</div>
                    <div className={`text-slate-400 ${responsiveClasses.subtitleSize}`}>@{user.username}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {isSearching && query.trim().length >= 2 && (
            <div className={`absolute w-full ${responsiveClasses.isCompact ? 'mt-1' : 'mt-2'} bg-slate-800 border border-slate-700 rounded-lg shadow-xl ${responsiveClasses.cardPadding} text-center text-slate-400 ${responsiveClasses.bodySize}`}>
              Searching...
            </div>
          )}

          {showResults && !isSearching && query.trim().length >= 2 && results.length === 0 && (
            <div className={`absolute w-full ${responsiveClasses.isCompact ? 'mt-1' : 'mt-2'} bg-slate-800 border border-slate-700 rounded-lg shadow-xl ${responsiveClasses.cardPadding} text-center text-slate-400 ${responsiveClasses.bodySize}`}>
              No users found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
