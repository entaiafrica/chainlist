import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, ExternalLink, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';
import { GradientCard } from '@/components/ui/gradient-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/utils/api';
import {
  formatAddress,
  formatHash,
  formatEther,
  formatGas,
  formatDateTime,
  formatTimeAgo,
  copyToClipboard,
  getTxType,
  getStatusColor,
  getStatusText
} from '@/utils/formatters';

export default function TransactionDetail() {
  const { hash } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTransaction();
  }, [hash]);

  async function fetchTransaction() {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getTransaction(hash);
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
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Transaction Not Found</h2>
          <p className="text-muted-foreground">{error}</p>
        </GradientCard>
      </div>
    );
  }

  const { transaction, logs, tokenTransfers = [] } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold gradient-text">Transaction Details</h1>
        </div>

        {/* Main Card */}
        <GradientCard className="p-8 mb-6">
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {transaction.status === 1 ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Success</Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>
                  </>
                )}
              </div>
              <Badge variant="outline">{getTxType(transaction)}</Badge>
            </div>

            {/* Transaction Hash */}
            <div>
              <label className="text-sm text-muted-foreground font-medium mb-2 block">
                Transaction Hash
              </label>
              <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
                <code className="flex-1 font-mono text-sm break-all">{transaction.hash}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(transaction.hash)}
                  className="copy-button"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Block & Timestamp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground font-medium mb-2 block">
                  Block Number
                </label>
                <Link
                  to={`/block/${transaction.block_number}`}
                  className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <span className="text-primary font-semibold text-lg">
                    #{parseInt(transaction.block_number).toLocaleString()}
                  </span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </Link>
              </div>
              <div>
                <label className="text-sm text-muted-foreground font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timestamp
                </label>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-semibold text-lg">
                    {formatDateTime(transaction.timestamp)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatTimeAgo(transaction.timestamp)}
                  </p>
                </div>
              </div>
            </div>

            {/* From/To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground font-medium mb-2 block">
                  From
                </label>
                <Link
                  to={`/address/${transaction.from_address}`}
                  className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <code className="font-mono text-sm flex-1 address-highlight">
                    {formatAddress(transaction.from_address)}
                  </code>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </Link>
              </div>
              <div>
                <label className="text-sm text-muted-foreground font-medium mb-2 block">
                  To
                </label>
                {transaction.to_address ? (
                  <Link
                    to={`/address/${transaction.to_address}`}
                    className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <code className="font-mono text-sm flex-1 address-highlight">
                      {formatAddress(transaction.to_address)}
                    </code>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </Link>
                ) : (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <Badge>Contract Creation</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Value & Gas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-muted-foreground font-medium mb-2 block">
                  Value
                </label>
                <p className="font-bold text-2xl gradient-text">
                  {formatEther(transaction.value)} BRK
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground font-medium mb-2 block">
                  Gas Used
                </label>
                <p className="font-semibold text-lg">
                  {formatGas(transaction.gas_used)}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground font-medium mb-2 block">
                  Gas Price
                </label>
                <p className="font-semibold text-lg">
                  {formatEther(transaction.gas_price)} BRK
                </p>
              </div>
            </div>

            {/* Nonce */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground font-medium mb-2 block">
                  Nonce
                </label>
                <p className="font-mono text-lg">{transaction.nonce}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground font-medium mb-2 block">
                  Position in Block
                </label>
                <p className="font-mono text-lg">#{transaction.transaction_index}</p>
              </div>
            </div>
          </div>
        </GradientCard>

        {/* Token Transfers */}
        {tokenTransfers && tokenTransfers.length > 0 && (
          <GradientCard className="p-8 mb-6">
            <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Token Transfers ({tokenTransfers.length})
            </h2>
            <div className="space-y-4">
              {tokenTransfers.map((transfer, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-muted/50 border border-border fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      {transfer.token_id ? `NFT #${transfer.token_id}` : 'ERC20 Transfer'}
                    </Badge>
                    <Link
                      to={`/address/${transfer.token_address}`}
                      className="text-xs font-mono text-primary hover:underline"
                    >
                      Token: {formatAddress(transfer.token_address)}
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <span className="text-xs text-muted-foreground">From:</span>
                      <Link
                        to={`/address/${transfer.from_address}`}
                        className="block font-mono text-sm text-primary hover:underline mt-1"
                      >
                        {formatAddress(transfer.from_address)}
                      </Link>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">To:</span>
                      <Link
                        to={`/address/${transfer.to_address}`}
                        className="block font-mono text-sm text-primary hover:underline mt-1"
                      >
                        {formatAddress(transfer.to_address)}
                      </Link>
                    </div>
                  </div>
                  {transfer.value && !transfer.token_id && (
                    <div className="mt-3 p-3 rounded-lg bg-primary/5">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <p className="text-xl font-bold gradient-text mt-1">
                        {formatEther(transfer.value)} BRK
                      </p>
                    </div>
                  )}
                  {transfer.token_id && (
                    <div className="mt-3 p-3 rounded-lg bg-accent/5">
                      <span className="text-sm text-muted-foreground">NFT Token ID:</span>
                      <p className="text-xl font-bold text-accent mt-1">
                        #{transfer.token_id}
                      </p>
                      {transfer.value && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Quantity: {transfer.value}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GradientCard>
        )}

        {/* Event Logs */}
        {logs && logs.length > 0 && (
          <GradientCard className="p-8">
            <h2 className="text-2xl font-bold gradient-text mb-6">
              Event Logs ({logs.length})
            </h2>
            <div className="space-y-4">
              {logs.map((log, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-muted/50 border border-border fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">Log #{log.log_index}</Badge>
                    <Link
                      to={`/address/${log.address}`}
                      className="text-xs font-mono text-primary hover:underline"
                    >
                      {formatAddress(log.address)}
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {log.topic0 && (
                      <div>
                        <span className="text-xs text-muted-foreground">Topic 0:</span>
                        <p className="text-xs font-mono text-muted-foreground break-all mt-1">
                          {log.topic0}
                        </p>
                      </div>
                    )}
                    {log.topic1 && (
                      <div>
                        <span className="text-xs text-muted-foreground">Topic 1:</span>
                        <p className="text-xs font-mono text-muted-foreground break-all mt-1">
                          {log.topic1}
                        </p>
                      </div>
                    )}
                    {log.topic2 && (
                      <div>
                        <span className="text-xs text-muted-foreground">Topic 2:</span>
                        <p className="text-xs font-mono text-muted-foreground break-all mt-1">
                          {log.topic2}
                        </p>
                      </div>
                    )}
                    {log.data && log.data !== '0x' && (
                      <div>
                        <span className="text-xs text-muted-foreground">Data:</span>
                        <p className="text-xs font-mono text-muted-foreground break-all mt-1">
                          {log.data}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GradientCard>
        )}
      </div>
    </div>
  );
}
