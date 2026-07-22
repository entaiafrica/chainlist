import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Wallet, TrendingUp, TrendingDown, ExternalLink, AlertCircle } from 'lucide-react';
import { GradientCard } from '@/components/ui/gradient-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/utils/api';
import {
  formatAddress,
  formatHash,
  formatEther,
  formatGas,
  formatTimeAgo,
  formatNumber
} from '@/utils/formatters';

export default function WalletTransactions({ walletAddress }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const limit = 25;

  useEffect(() => {
    if (walletAddress) {
      fetchTransactions();
    } else {
      setLoading(false);
    }
  }, [walletAddress, page, typeFilter]);

  async function fetchTransactions() {
    setLoading(true);
    try {
      const result = await api.getAddressTransactions(walletAddress, page, limit, typeFilter);
      setTransactions(result.transactions || []);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-16">
          <GradientCard className="p-12 text-center max-w-2xl mx-auto">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to view your transaction history.
            </p>
          </GradientCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Wallet className="w-10 h-10 text-primary" />
              <h1 className="text-5xl font-bold gradient-text font-cairo">
                Your Transactions
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-2">
              Transaction history for wallet
            </p>
            <code className="text-lg font-mono text-primary px-4 py-2 rounded-lg bg-primary/10">
              {formatAddress(walletAddress)}
            </code>
          </div>

          {/* Stats */}
          {pagination && (
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Total Transactions
                </p>
                <p className="text-2xl font-bold gradient-text">
                  {formatNumber(pagination.total)}
                </p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Showing
                </p>
                <p className="text-2xl font-bold gradient-text">
                  {((page - 1) * limit) + 1} - {Math.min(page * limit, pagination.total)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <Tabs value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setPage(1); }}>
            <TabsList>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Sent
              </TabsTrigger>
              <TabsTrigger value="received" className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Received
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {pagination && (
            <p className="text-sm text-muted-foreground">
              Page {page} of {pagination.totalPages}
            </p>
          )}
        </div>

        {/* Transactions List */}
        <GradientCard className="p-6 mb-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No Transactions Found</h3>
              <p className="text-muted-foreground">
                {typeFilter !== 'all'
                  ? `No ${typeFilter} transactions found for this wallet.`
                  : 'This wallet has no recorded transactions yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const isSent = tx.from_address.toLowerCase() === walletAddress.toLowerCase();
                const isReceived = tx.to_address?.toLowerCase() === walletAddress.toLowerCase();

                return (
                  <Link
                    key={tx.hash}
                    to={`/tx/${tx.hash}`}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-all group hover:shadow-md"
                  >
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center group-hover:opacity-80 transition-colors flex-shrink-0 ${
                      isSent ? 'bg-red-500/10' : 'bg-green-500/10'
                    }`}>
                      {isSent ? (
                        <TrendingUp className="w-6 h-6 text-red-500" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-green-500" />
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={isSent ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}>
                              {isSent ? 'Sent' : 'Received'}
                            </Badge>
                            <Badge className={tx.status === 1 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}>
                              {tx.status === 1 ? 'Success' : 'Failed'}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {formatTimeAgo(tx.timestamp)}
                            </p>
                          </div>
                          <p className="font-mono text-sm mb-2 truncate">
                            {formatHash(tx.hash)}
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-lg gradient-text mb-1">
                            {tx.token_value ? formatEther(tx.token_value) : formatEther(tx.value)} BRK
                          </p>
                          {tx.transfer_count > 0 && (
                            <p className="text-xs text-accent mb-1">
                              {tx.transfer_count} token transfer{tx.transfer_count > 1 ? 's' : ''}
                            </p>
                          )}
                          <Link
                            to={`/block/${tx.block_number}`}
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 justify-end"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Block #{formatNumber(tx.block_number)}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      {/* From/To */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-muted-foreground flex-shrink-0">From:</span>
                          <code className={`font-mono truncate ${
                            isSent ? 'text-primary font-semibold' : 'text-muted-foreground'
                          }`}>
                            {formatAddress(tx.from_address)}
                          </code>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-muted-foreground flex-shrink-0">To:</span>
                          {tx.to_address ? (
                            <code className={`font-mono truncate ${
                              isReceived ? 'text-primary font-semibold' : 'text-muted-foreground'
                            }`}>
                              {formatAddress(tx.to_address)}
                            </code>
                          ) : (
                            <Badge variant="outline">Contract Creation</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
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
