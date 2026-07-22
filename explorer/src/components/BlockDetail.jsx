import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, ExternalLink, Clock, Activity, Box } from 'lucide-react';
import { GradientCard } from '@/components/ui/gradient-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/utils/api';
import {
  formatAddress,
  formatHash,
  formatGas,
  formatDateTime,
  formatTimeAgo,
  copyToClipboard,
  formatNumber
} from '@/utils/formatters';

export default function BlockDetail() {
  const { number } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBlock();
  }, [number]);

  async function fetchBlock() {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getBlock(number);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(text) {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <GradientCard className="p-8">
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-8 w-full" />
        </GradientCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <GradientCard className="p-8 text-center">
          <Box className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Block Not Found</h2>
          <p className="text-muted-foreground">{error}</p>
        </GradientCard>
      </div>
    );
  }

  const { block, transactions } = data;
  const prevBlock = parseInt(block.number) - 1;
  const nextBlock = parseInt(block.number) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold gradient-text">
              Block #{parseInt(block.number).toLocaleString()}
            </h1>
            <div className="flex gap-2">
              {prevBlock >= 0 && (
                <Button variant="outline" asChild>
                  <Link to={`/block/${prevBlock}`}>← Previous</Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to={`/block/${nextBlock}`}>Next →</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <GradientCard className="p-8 mb-6">
          <div className="space-y-6">
            {/* Block Hash */}
            <div>
              <label className="text-sm text-muted-foreground font-medium mb-2 block">
                Block Hash
              </label>
              <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
                <code className="flex-1 font-mono text-sm break-all">{block.hash}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(block.hash)}
                  className="copy-button"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Parent Hash */}
            <div>
              <label className="text-sm text-muted-foreground font-medium mb-2 block">
                Parent Hash
              </label>
              <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
                <code className="flex-1 font-mono text-sm break-all">{block.parent_hash}</code>
              </div>
            </div>

            {/* Timestamp */}
            <div>
              <label className="text-sm text-muted-foreground font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timestamp
              </label>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="font-semibold text-lg">
                  {formatDateTime(block.timestamp)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatTimeAgo(block.timestamp)}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-muted-foreground font-medium mb-2 block flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Transactions
                </label>
                <p className="font-bold text-2xl gradient-text">
                  {formatNumber(block.transaction_count)}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground font-medium mb-2 block">
                  Gas Used
                </label>
                <p className="font-semibold text-lg">
                  {formatGas(block.gas_used)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((parseInt(block.gas_used) / parseInt(block.gas_limit)) * 100).toFixed(2)}% of limit
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground font-medium mb-2 block">
                  Gas Limit
                </label>
                <p className="font-semibold text-lg">
                  {formatGas(block.gas_limit)}
                </p>
              </div>
            </div>

            {/* Miner */}
            <div>
              <label className="text-sm text-muted-foreground font-medium mb-2 block">
                Miner (Validator)
              </label>
              <Link
                to={`/address/${block.miner}`}
                className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
              >
                <code className="font-mono text-sm address-highlight flex-1">
                  {formatAddress(block.miner)}
                </code>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </Link>
            </div>
          </div>
        </GradientCard>

        {/* Transactions */}
        {transactions && transactions.length > 0 ? (
          <GradientCard className="p-8">
            <h2 className="text-2xl font-bold gradient-text mb-6">
              Transactions ({transactions.length})
            </h2>
            <div className="space-y-3">
              {transactions.map((tx, idx) => (
                <Link
                  key={idx}
                  to={`/tx/${tx.hash}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-all group fade-in"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-sm mb-1">{formatHash(tx.hash)}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>From: {formatAddress(tx.from_address)}</span>
                        {tx.to_address && (
                          <>
                            <span>→</span>
                            <span>To: {formatAddress(tx.to_address)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {tx.status === 1 ? (
                      <Badge className="bg-green-500/10 text-green-500">Success</Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-500">Failed</Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </GradientCard>
        ) : (
          <GradientCard className="p-8 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No transactions in this block</p>
          </GradientCard>
        )}
      </div>
    </div>
  );
}
