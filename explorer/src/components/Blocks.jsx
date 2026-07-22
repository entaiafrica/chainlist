import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Users, Zap, Activity } from 'lucide-react';
import { GradientCard } from '@/components/ui/gradient-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import SearchBar from './SearchBar';
import api from '@/utils/api';
import {
  formatAddress,
  formatGas,
  formatTimeAgo,
  formatDateTime,
  formatNumber
} from '@/utils/formatters';

export default function Blocks() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const limit = 25;

  useEffect(() => {
    fetchBlocks();
  }, [page]);

  async function fetchBlocks() {
    setLoading(true);
    try {
      const result = await api.getBlocks(page, limit);
      setBlocks(result.blocks || []);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error fetching blocks:', error);
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-bold gradient-text mb-4 font-cairo">
              Blocks
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Browse the complete block history of the FirstBrick blockchain
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
                  Total Blocks
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
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Page
                </p>
                <p className="text-2xl font-bold gradient-text">
                  {page} of {pagination.totalPages}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Blocks List */}
        <GradientCard className="p-6 mb-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : blocks.length === 0 ? (
            <div className="text-center py-16">
              <Box className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No Blocks Found</h3>
              <p className="text-muted-foreground">
                No blocks have been recorded yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {blocks.map((block) => (
                <Link
                  key={block.number}
                  to={`/block/${block.number}`}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-all group hover:shadow-md"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <Box className="w-6 h-6 text-primary" />
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold gradient-text">
                            Block #{formatNumber(block.number)}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {formatNumber(block.transaction_count)} txs
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatTimeAgo(block.timestamp)}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm font-semibold">
                            {formatGas(block.gas_used)}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {((parseInt(block.gas_used) / parseInt(block.gas_limit)) * 100).toFixed(1)}% utilization
                        </p>
                      </div>
                    </div>

                    {/* Block Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-muted-foreground flex-shrink-0">Hash:</span>
                        <code className="font-mono text-xs truncate">
                          {block.hash?.substring(0, 16)}...{block.hash?.substring(block.hash.length - 8)}
                        </code>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <Users className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground flex-shrink-0">Miner:</span>
                        <Link
                          to={`/address/${block.miner}`}
                          className="font-mono text-xs text-primary hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {formatAddress(block.miner)}
                        </Link>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{formatDateTime(block.timestamp)}</span>
                      <span>•</span>
                      <span>Gas Limit: {formatGas(block.gas_limit)}</span>
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
