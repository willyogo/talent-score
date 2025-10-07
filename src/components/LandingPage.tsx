import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { searchNeynarUsers, NeynarUser } from '../utils/api';

export default function LandingPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NeynarUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Talent Scores</h1>
          <p className="text-slate-400 text-sm">Search for Farcaster users to view their Talent Protocol scores</p>
        </div>

        <div className="relative" ref={resultsRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {showResults && results.length > 0 && (
            <div className="absolute w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-10">
              {results.map((user) => (
                <button
                  key={user.fid}
                  onClick={() => handleUserSelect(user.fid)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-700 transition-colors text-left border-b border-slate-700 last:border-b-0"
                >
                  <img
                    src={user.pfp_url}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{user.display_name}</div>
                    <div className="text-slate-400 text-sm">@{user.username}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {isSearching && query.trim().length >= 2 && (
            <div className="absolute w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4 text-center text-slate-400">
              Searching...
            </div>
          )}

          {showResults && !isSearching && query.trim().length >= 2 && results.length === 0 && (
            <div className="absolute w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4 text-center text-slate-400">
              No users found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
