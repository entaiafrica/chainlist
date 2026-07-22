import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Box, Activity, Wallet, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import api from '@/utils/api';
import { formatAddress, formatHash } from '@/utils/formatters';

export default function SearchBar({ className }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      await performSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  async function performSearch() {
    if (query.length < 3) return;

    setLoading(true);
    try {
      const data = await api.search(query);
      setResults(data.results || []);
      setShowResults(true);
      setSelectedIndex(0);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(result) {
    if (!result) return;

    if (result.type === 'transaction') {
      navigate(`/tx/${result.value}`);
    } else if (result.type === 'block') {
      navigate(`/block/${result.value}`);
    } else if (result.type === 'address') {
      navigate(`/address/${result.value}`);
    }

    setQuery('');
    setShowResults(false);
    inputRef.current?.blur();
  }

  function handleKeyDown(e) {
    if (!showResults || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowResults(false);
      inputRef.current?.blur();
    }
  }

  function clearSearch() {
    setQuery('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  }

  function getIcon(type) {
    switch (type) {
      case 'block':
        return <Box className="w-4 h-4" />;
      case 'transaction':
        return <Activity className="w-4 h-4" />;
      case 'address':
        return <Wallet className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  }

  function getTypeColor(type) {
    switch (type) {
      case 'block':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'transaction':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'address':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  }

  function formatValue(result) {
    if (result.type === 'block') {
      return `Block #${parseInt(result.value).toLocaleString()}`;
    } else if (result.type === 'transaction') {
      return formatHash(result.value);
    } else if (result.type === 'address') {
      return result.label || formatAddress(result.value);
    }
    return result.value;
  }

  return (
    <div ref={searchRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        <Input
          ref={inputRef}
          type="text"
          placeholder="Search by address, transaction hash, or block number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
          className="pl-10 pr-10 h-11 bg-muted/50 border-border focus:border-primary transition-colors"
        />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-muted-foreground px-3 py-2 font-medium">
              Search Results ({results.length})
            </div>
            {results.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left',
                  selectedIndex === idx
                    ? 'bg-primary/10 border-primary/50'
                    : 'hover:bg-muted/50',
                  'border border-transparent'
                )}
              >
                <div className={cn('p-2 rounded-lg', getTypeColor(result.type))}>
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={cn('text-xs', getTypeColor(result.type))}>
                      {result.type}
                    </Badge>
                    {result.label && result.type === 'address' && (
                      <span className="text-xs text-muted-foreground truncate">
                        {result.label}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-sm truncate">
                    {formatValue(result)}
                  </p>
                  {result.description && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {result.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && !loading && query.length >= 3 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 p-6 text-center">
          <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">No results found</p>
          <p className="text-xs text-muted-foreground">
            Try searching for a block number, transaction hash, or address
          </p>
        </div>
      )}

      {/* Keyboard Hints */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 translate-y-full">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">Enter</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
