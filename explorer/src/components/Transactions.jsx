import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Filter, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { GradientCard } from '@/components/ui/gradient-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchBar from './SearchBar';
import api from '@/utils/api';
import {
  formatAddress,
  formatHash,
  formatEther,
  formatGas,
  formatTimeAgo,
  formatDateTime,
  formatNumber
} from '@/utils/formatters';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const limit = 25;

  useEffect(() => {
    fetchTransactions();
  }, [page, statusFilter]);

  async function fetchTransactions() {
    setLoading(true);
    try {
      const status = statusFilter === 'all' ? null : statusFilter === 'success' ? 1 : 0;
      const result = await api.getTransactions(page, limit, status);
      setTransactions(result.transactions || []);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleStatusFilterChange(newFilter) {
    setStatusFilter(newFilter);
    setPage(1); // Reset to first page when filter changes
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-bold gradient-text mb-4 font-cairo">
              Transactions
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Complete transaction history on the FirstBrick blockchain
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto">
              <SearchBar />
            </div>
          </div>

          {/* Stats Bar */}
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
          <Tabs value={statusFilter} onValueChange={handleStatusFilterChange}>
            <TabsList>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="success" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Success
              </TabsTrigger>
              <TabsTrigger value="failed" className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Failed
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <p className="text-sm text-muted-foreground">
            Page {page} of {pagination?.totalPages || 1}
          </p>
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
              <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No Transactions Found</h3>
              <p className="text-muted-foreground">
                {statusFilter !== 'all'
                  ? `No ${statusFilter} transactions found. Try changing the filter.`
                  : 'No transactions have been recorded yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <Link
                  key={tx.hash}
                  to={`/tx/${tx.hash}`}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-all group hover:shadow-md"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors flex-shrink-0">
                    <Activity className="w-6 h-6 text-accent" />
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
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
                        <Link
                          to={`/address/${tx.from_address}`}
                          className="font-mono text-primary hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {formatAddress(tx.from_address)}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-muted-foreground flex-shrink-0">To:</span>
                        {tx.to_address ? (
                          <Link
                            to={`/address/${tx.to_address}`}
                            className="font-mono text-primary hover:underline truncate"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {formatAddress(tx.to_address)}
                          </Link>
                        ) : (
                          <Badge variant="outline">Contract Creation</Badge>
                        )}
                      </div>
                    </div>

                    {/* Gas Info */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>Gas: {formatGas(tx.gas_used)}</span>
                      <span>•</span>
                      <span>Fee: {formatEther(tx.gas_price)} BRK</span>
                      <span>•</span>
                      <span>{formatDateTime(tx.timestamp)}</span>
                    </div>
                  </div>
                </Link>
              ))}
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

            <div className="flex items-center gap-2">
              {/* First page */}
              {page > 3 && (
                <>
                  <Button
                    variant={page === 1 ? "default" : "outline"}
                    onClick={() => setPage(1)}
                    disabled={loading}
                  >
                    1
                  </Button>
                  {page > 4 && <span className="text-muted-foreground">...</span>}
                </>
              )}

              {/* Pages around current */}
              {[...Array(5)].map((_, i) => {
                const pageNum = page - 2 + i;
                if (pageNum < 1 || pageNum > pagination.totalPages) return null;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    onClick={() => setPage(pageNum)}
                    disabled={loading}
                    className={page === pageNum ? "gradient-primary text-white" : ""}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              {/* Last page */}
              {page < pagination.totalPages - 2 && (
                <>
                  {page < pagination.totalPages - 3 && <span className="text-muted-foreground">...</span>}
                  <Button
                    variant={page === pagination.totalPages ? "default" : "outline"}
                    onClick={() => setPage(pagination.totalPages)}
                    disabled={loading}
                  >
                    {pagination.totalPages}
                  </Button>
                </>
              )}
            </div>

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
