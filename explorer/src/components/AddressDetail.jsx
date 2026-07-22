import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, ExternalLink, Activity, Wallet, TrendingUp, TrendingDown, Coins, Home, MapPin } from 'lucide-react';
import { GradientCard } from '@/components/ui/gradient-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/utils/api';
import {
  formatAddress,
  formatHash,
  formatEther,
  formatGas,
  formatDateTime,
  formatTimeAgo,
  copyToClipboard,
  formatNumber
} from '@/utils/formatters';
import { fetchPropertyMetadata, getPropertyMetadata, getTokenMetadata } from '@/utils/propertyMetadata';

export default function AddressDetail() {
  const { address } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [propertyMetadata, setPropertyMetadata] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [txType, setTxType] = useState('all');
  const [page, setPage] = useState(1);
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    fetchAddressData();
  }, [address]);

  useEffect(() => {
    fetchTransactions();
  }, [address, txType, page]);

  // Fetch property metadata for NFTs
  useEffect(() => {
    async function loadPropertyMetadata() {
      const nftTokens = tokens.filter(t => t.token_id !== null);
      if (nftTokens.length === 0) return;

      const metadata = {};
      for (const token of nftTokens) {
        const data = await fetchPropertyMetadata(parseInt(token.token_id));
        metadata[token.token_id] = data;
      }
      setPropertyMetadata(metadata);
    }

    loadPropertyMetadata();
  }, [tokens]);

  async function fetchAddressData() {
    setLoading(true);
    setError(null);
    try {
      const [addressData, tokensData] = await Promise.all([
        api.getAddress(address),
        api.getAddressTokens(address).catch(() => ({ tokens: [] }))
      ]);
      setData(addressData);
      setTokens(tokensData.tokens || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTransactions() {
    setTxLoading(true);
    try {
      const result = await api.getAddressTransactions(address, page, 25, txType);
      setTransactions(result.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setTxLoading(false);
    }
  }

  async function handleCopy(text) {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleTypeChange(newType) {
    setTxType(newType);
    setPage(1);
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
          <Wallet className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Address Not Found</h2>
          <p className="text-muted-foreground">{error}</p>
        </GradientCard>
      </div>
    );
  }

  const addressInfo = data.address;
  const stats = data.stats || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold gradient-text mb-2">Address Details</h1>
          <p className="text-muted-foreground">
            View complete transaction history and token holdings
          </p>
        </div>

        {/* Main Card */}
        <GradientCard className="p-8 mb-6">
          <div className="space-y-6">
            {/* Address */}
            <div>
              <label className="text-sm text-muted-foreground font-medium mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Address
              </label>
              <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
                <code className="flex-1 font-mono text-sm break-all">{address}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(address)}
                  className="copy-button"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-500 mt-2">✓ Copied to clipboard</p>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="text-sm text-muted-foreground font-medium mb-2 block">
                  Balance
                </label>
                <p className="font-bold text-2xl gradient-text">
                  {formatEther(addressInfo.balance || '0')} BRK
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground font-medium mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Transactions
                </label>
                <p className="font-semibold text-lg">
                  {formatNumber(addressInfo.transaction_count || 0)}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground font-medium mb-2 block">
                  First Seen
                </label>
                <p className="font-semibold text-sm">
                  {addressInfo.first_seen_block ? (
                    <>
                      <Link
                        to={`/block/${addressInfo.first_seen_block}`}
                        className="text-primary hover:underline"
                      >
                        #{formatNumber(addressInfo.first_seen_block)}
                      </Link>
                      {addressInfo.first_seen_timestamp && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(addressInfo.first_seen_timestamp)}
                        </p>
                      )}
                    </>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground font-medium mb-2 block">
                  Last Seen
                </label>
                <p className="font-semibold text-sm">
                  {addressInfo.last_seen_block ? (
                    <>
                      <Link
                        to={`/block/${addressInfo.last_seen_block}`}
                        className="text-primary hover:underline"
                      >
                        #{formatNumber(addressInfo.last_seen_block)}
                      </Link>
                      {addressInfo.last_seen_timestamp && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(addressInfo.last_seen_timestamp)}
                        </p>
                      )}
                    </>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
            </div>

            {/* Transaction Statistics */}
            {(stats.total_sent || stats.total_received) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <label className="text-sm text-muted-foreground font-medium">
                      Total Received
                    </label>
                  </div>
                  <p className="font-bold text-xl text-green-500">
                    {formatEther(stats.total_received || '0')} BRK
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatNumber(stats.received_count || 0)} transactions
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <label className="text-sm text-muted-foreground font-medium">
                      Total Sent
                    </label>
                  </div>
                  <p className="font-bold text-xl text-red-500">
                    {formatEther(stats.total_sent || '0')} BRK
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatNumber(stats.sent_count || 0)} transactions
                  </p>
                </div>
              </div>
            )}
          </div>
        </GradientCard>

        {/* Token Holdings */}
        {tokens && tokens.length > 0 && (
          <GradientCard className="p-8 mb-6">
            <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-2">
              <Coins className="w-6 h-6" />
              Token Holdings ({tokens.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {tokens.map((token, idx) => {
                const tokenMeta = getTokenMetadata(token.token_address);
                const isNFT = token.token_id !== null;
                const propertyData = isNFT ? (propertyMetadata[token.token_id] || getPropertyMetadata(parseInt(token.token_id))) : null;

                if (isNFT) {
                  // NFT Card Display
                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg"
                    >
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative flex items-center justify-center">
                        <img
                          src={propertyData.image}
                          alt={propertyData.name}
                          className="w-24 h-24 object-contain opacity-50"
                        />
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-accent/90 text-white">NFT</Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg gradient-text mb-1">
                              {propertyData.name}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                              <MapPin className="w-3 h-3" />
                              <span>{propertyData.location}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Property #{token.token_id}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-primary/5">
                            <p className="text-xs text-muted-foreground">Your Shares</p>
                            <p className="text-lg font-bold gradient-text">
                              {formatNumber(token.balance)}
                            </p>
                          </div>
                          <div className="p-2 rounded-lg bg-accent/5">
                            <p className="text-xs text-muted-foreground">Share Value</p>
                            <p className="text-lg font-bold text-accent">
                              {formatNumber(token.balance)} BRK
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link to={`/address/${token.token_address}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Contract
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  // ERC20 Token Display
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-all"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <img
                          src={tokenMeta.logo}
                          alt={tokenMeta.symbol}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{tokenMeta.name}</h3>
                          <Badge className="gradient-primary text-white">{tokenMeta.symbol}</Badge>
                        </div>
                        <Link
                          to={`/address/${token.token_address}`}
                          className="font-mono text-xs text-primary hover:underline"
                        >
                          {formatAddress(token.token_address)}
                        </Link>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl gradient-text">
                          {formatEther(token.balance)}
                        </p>
                        <p className="text-xs text-muted-foreground">{tokenMeta.symbol}</p>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </GradientCard>
        )}

        {/* Transactions */}
        <GradientCard className="p-8">
          <h2 className="text-2xl font-bold gradient-text mb-6">Transactions</h2>

          {/* Tabs for filtering */}
          <Tabs value={txType} onValueChange={handleTypeChange} className="mb-6">
            <TabsList className="grid w-full md:w-auto grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="received">Received</TabsTrigger>
            </TabsList>
          </Tabs>

          {txLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
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
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {tx.from_address.toLowerCase() === address.toLowerCase() ? (
                            <>
                              <TrendingDown className="w-3 h-3 text-red-500" />
                              <span>To: {formatAddress(tx.to_address)}</span>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="w-3 h-3 text-green-500" />
                              <span>From: {formatAddress(tx.from_address)}</span>
                            </>
                          )}
                        </span>
                        <span>•</span>
                        <span>{formatTimeAgo(tx.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold mb-1">
                      {formatEther(tx.value)} BRK
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className={tx.status === 1 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
                        {tx.status === 1 ? 'Success' : 'Failed'}
                      </Badge>
                      <Link
                        to={`/block/${tx.block_number}`}
                        className="text-xs text-muted-foreground hover:text-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        #{formatNumber(tx.block_number)}
                      </Link>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {transactions.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Page {page}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={transactions.length < 25}
              >
                Next
              </Button>
            </div>
          )}
        </GradientCard>
      </div>
    </div>
  );
}
