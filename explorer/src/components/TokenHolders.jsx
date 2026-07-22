import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, TrendingUp, Activity, ArrowLeft } from 'lucide-react';
import { GradientCard } from '@/components/ui/gradient-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/utils/api';
import { formatAddress, formatEther, formatNumber } from '@/utils/formatters';

export default function TokenHolders() {
  const { address } = useParams();
  const [stats, setStats] = useState(null);
  const [holders, setHolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const limit = 50;

  // Token addresses
  const BRK_TOKEN = '0x5b1869d9a4c187f2eaa108f3062412ecf0526b24';
  const MARKETPLACE = '0x254dffcd3277c0b1660f6d42efbb754edababc2b';

  const tokenInfo = {
    [BRK_TOKEN.toLowerCase()]: { name: 'BRK Token', symbol: 'BRK', type: 'ERC20' },
    [MARKETPLACE.toLowerCase()]: { name: 'FirstBrick Properties', symbol: 'PROPERTY', type: 'ERC1155' },
  };

  const token = tokenInfo[address?.toLowerCase()] || { name: 'Unknown Token', symbol: 'TOKEN', type: 'Unknown' };

  useEffect(() => {
    fetchData();
  }, [address, page]);

  async function fetchData() {
    setLoading(true);
    try {
      const [statsData, holdersData] = await Promise.all([
        api.getTokenStats(address).catch(() => null),
        api.getTokenHolders(address, page, limit)
      ]);

      setStats(statsData);
      setHolders(holdersData.holders || []);
      setPagination(holdersData.pagination);
    } catch (error) {
      console.error('Error fetching token data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/tokens">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tokens
            </Button>
          </Link>
          <h1 className="text-5xl font-bold gradient-text mb-4 font-cairo">
            {token.name} Holders
          </h1>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-base px-4 py-1">
              {token.type}
            </Badge>
            <code className="text-sm text-muted-foreground font-mono">
              {formatAddress(address)}
            </code>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GradientCard className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold">Total Holders</h3>
              </div>
              <p className="text-4xl font-bold gradient-text">
                {formatNumber(stats.holderCount)}
              </p>
            </GradientCard>

            <GradientCard className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-8 h-8 text-accent" />
                <h3 className="text-lg font-semibold">Total Supply</h3>
              </div>
              <p className="text-4xl font-bold gradient-text">
                {token.type === 'ERC20' ? formatEther(stats.totalSupply) : formatNumber(stats.totalSupply)}
              </p>
            </GradientCard>

            <GradientCard className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-8 h-8 text-green-500" />
                <h3 className="text-lg font-semibold">Total Transfers</h3>
              </div>
              <p className="text-4xl font-bold gradient-text">
                {formatNumber(stats.transferCount)}
              </p>
            </GradientCard>
          </div>
        )}

        {/* Holders List */}
        <GradientCard className="p-8 mb-6">
          <h2 className="text-2xl font-bold gradient-text mb-6">
            Holder Rankings
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : holders.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No holders found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {holders.map((holder, idx) => {
                const rank = (page - 1) * limit + idx + 1;
                const percentage = stats ? (parseFloat(holder.balance) / parseFloat(stats.totalSupply) * 100).toFixed(2) : '0';

                return (
                  <div
                    key={`${holder.holder_address}-${holder.token_id || 'default'}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold gradient-text">
                          #{rank}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/address/${holder.holder_address}`}
                          className="font-mono text-sm text-primary hover:underline block truncate"
                        >
                          {holder.holder_address}
                        </Link>
                        {holder.token_id && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Property #{holder.token_id}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xl font-bold gradient-text">
                        {token.type === 'ERC20' ? formatEther(holder.balance) : formatNumber(holder.balance)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {percentage}% of supply
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GradientCard>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages || loading}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
