import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Box, Zap, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { GradientCard } from '@/components/ui/gradient-card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import SearchBar from './SearchBar';
import NetworkSetup from './NetworkSetup';
import api from '@/utils/api';
import {
  formatAddress,
  formatHash,
  formatEther,
  formatGas,
  formatTimeAgo,
  formatNumber
} from '@/utils/formatters';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentBlocks, setRecentBlocks] = useState([]);
  const [recentTxs, setRecentTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboardData() {
    try {
      const [statsData, blocksData, txsData] = await Promise.all([
        api.getStats().catch(() => null),
        api.getBlocks(1, 5).catch(() => ({ blocks: [] })),
        api.getTransactions(1, 5).catch(() => ({ transactions: [] }))
      ]);

      setStats(statsData);
      setRecentBlocks(blocksData.blocks || []);
      setRecentTxs(txsData.transactions || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
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
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold gradient-text mb-4 font-cairo">
            FirstBrick Blockchain Explorer
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Real-time insights into the FirstBrick blockchain network
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <SearchBar />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Latest Block"
            value={stats?.latestBlock ? `#${formatNumber(stats.latestBlock)}` : 'Loading...'}
            icon={Box}
            trend="Updated just now"
          />
          <StatCard
            title="Total Transactions"
            value={stats?.totalTransactions ? formatNumber(stats.totalTransactions) : 'Loading...'}
            icon={Activity}
            trend={stats?.txToday ? `+${formatNumber(stats.txToday)} today` : 'Syncing...'}
          />
          <StatCard
            title="Network Nodes"
            value={stats?.peerCount !== undefined ? stats.peerCount + 1 : 'Loading...'}
            icon={Users}
            trend={stats?.peerCount !== undefined ? `${stats.peerCount} connected peers` : 'Checking...'}
          />
          <StatCard
            title="Avg Block Time"
            value={stats?.avgBlockTime ? `${stats.avgBlockTime}s` : 'N/A'}
            icon={Zap}
            trend="Last 100 blocks"
          />
        </div>

        {/* Network Setup */}
        <div className="mb-8">
          <NetworkSetup />
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recent Blocks */}
          <GradientCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
                <Box className="w-6 h-6" />
                Recent Blocks
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/blocks" className="flex items-center gap-1">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {recentBlocks.length === 0 ? (
              <div className="text-center py-8">
                <Box className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Loading blocks...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBlocks.map((block) => (
                  <Link
                    key={block.number}
                    to={`/block/${block.number}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-all group hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Box className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">
                          Block #{formatNumber(block.number)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatTimeAgo(block.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {formatNumber(block.transaction_count)} txs
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {formatGas(block.gas_used)} gas
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </GradientCard>

          {/* Recent Transactions */}
          <GradientCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
                <Activity className="w-6 h-6" />
                Recent Transactions
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/transactions" className="flex items-center gap-1">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {recentTxs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Loading transactions...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTxs.map((tx) => (
                  <Link
                    key={tx.hash}
                    to={`/tx/${tx.hash}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-all group hover:shadow-md"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <Activity className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm mb-1 truncate">
                          {formatHash(tx.hash)}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <span className="truncate">
                            {formatAddress(tx.from_address)}
                          </span>
                          <span>→</span>
                          <span className="truncate">
                            {tx.to_address ? formatAddress(tx.to_address) : 'Contract'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold mb-1">
                        {tx.token_value ? formatEther(tx.token_value) : formatEther(tx.value)} BRK
                      </p>
                      {tx.transfer_count > 0 && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {tx.transfer_count} token transfer{tx.transfer_count > 1 ? 's' : ''}
                        </p>
                      )}
                      <div className="flex items-center justify-end gap-2">
                        <Badge className={tx.status === 1 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
                          {tx.status === 1 ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </GradientCard>
        </div>

        {/* Network Stats Banner */}
        <GradientCard className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <p className="text-sm text-muted-foreground font-medium">
                  Sync Progress
                </p>
              </div>
              <p className="text-2xl font-bold gradient-text">
                {stats?.syncProgress ? `${stats.syncProgress}%` : 'Syncing...'}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground font-medium">
                  Total Blocks
                </p>
              </div>
              <p className="text-2xl font-bold gradient-text">
                {stats?.totalBlocks ? formatNumber(stats.totalBlocks) : 'Loading...'}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-accent" />
                <p className="text-sm text-muted-foreground font-medium">
                  Network Status
                </p>
              </div>
              <Badge className="bg-green-500/10 text-green-500 text-lg px-4 py-1">
                Healthy
              </Badge>
            </div>
          </div>
        </GradientCard>
      </div>
    </div>
  );
}
