import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Coins, Users, TrendingUp, Activity, ExternalLink, ArrowRight } from 'lucide-react';
import { GradientCard } from '@/components/ui/gradient-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/utils/api';
import { formatNumber, formatEther } from '@/utils/formatters';

export default function Tokens() {
  const [brkStats, setBrkStats] = useState(null);
  const [nftStats, setNftStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const BRK_TOKEN = '0x5b1869d9a4c187f2eaa108f3062412ecf0526b24';
  const MARKETPLACE = '0x254dffcd3277c0b1660f6d42efbb754edababc2b';

  useEffect(() => {
    fetchTokenData();
  }, []);

  async function fetchTokenData() {
    setLoading(true);
    try {
      const [brkData, nftData] = await Promise.all([
        api.getTokenStats(BRK_TOKEN).catch(() => null),
        api.getTokenStats(MARKETPLACE).catch(() => null)
      ]);
      setBrkStats(brkData);
      setNftStats(nftData);
    } catch (error) {
      console.error('Error fetching token data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-96 w-full" />
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
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coins className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold gradient-text font-cairo">
              FirstBrick Tokens
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Explore token metrics, holders, and transfer activity
          </p>
        </div>

        {/* Token Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* BRK Token */}
          <GradientCard className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold gradient-text">BRK Token</h2>
                  <Badge className="gradient-primary text-white">ERC20</Badge>
                </div>
                <p className="text-muted-foreground">
                  FirstBrick main utility token for property investments
                </p>
              </div>
              <Coins className="w-12 h-12 text-primary opacity-50" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <p className="text-sm text-muted-foreground font-medium">Holders</p>
                </div>
                <p className="text-3xl font-bold gradient-text">
                  {brkStats ? formatNumber(brkStats.holderCount) : 'Loading...'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <p className="text-sm text-muted-foreground font-medium">Total Supply</p>
                </div>
                <p className="text-3xl font-bold gradient-text">
                  {brkStats ? formatNumber(parseFloat(formatEther(brkStats.totalSupply))) : 'Loading...'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-muted-foreground font-medium">Transfers</p>
                </div>
                <p className="text-3xl font-bold text-green-500">
                  {brkStats ? formatNumber(brkStats.transferCount) : 'Loading...'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-primary" />
                  <p className="text-sm text-muted-foreground font-medium">Decimals</p>
                </div>
                <p className="text-3xl font-bold gradient-text">18</p>
              </div>
            </div>

            {/* Contract Address */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground font-medium mb-2">Contract Address</p>
              <Link
                to={`/address/${BRK_TOKEN}`}
                className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-primary break-all">
                    {BRK_TOKEN}
                  </code>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-2" />
                </div>
              </Link>
            </div>

            {/* Top Holders Preview */}
            {brkStats && brkStats.topHolders && brkStats.topHolders.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold">Top Holders</h3>
                  <Link to={`/token/${BRK_TOKEN}/holders`}>
                    <Button variant="ghost" size="sm" className="text-primary">
                      View All
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-2">
                  {brkStats.topHolders.slice(0, 3).map((holder, idx) => (
                    <Link
                      key={holder.holder_address}
                      to={`/address/${holder.holder_address}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold gradient-text">#{idx + 1}</span>
                        </div>
                        <code className="text-sm font-mono text-primary">
                          {holder.holder_address.substring(0, 10)}...{holder.holder_address.substring(38)}
                        </code>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatNumber(parseFloat(formatEther(holder.balance)))} BRK
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link to={`/token/${BRK_TOKEN}/holders`} className="flex-1">
                <Button className="w-full gradient-primary text-white">
                  <Users className="w-4 h-4 mr-2" />
                  View All Holders
                </Button>
              </Link>
              <Link to={`/address/${BRK_TOKEN}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Contract Details
                </Button>
              </Link>
            </div>
          </GradientCard>

          {/* NFT Marketplace */}
          <GradientCard className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold gradient-text">FirstBrick Properties</h2>
                  <Badge className="bg-accent/10 text-accent border-accent/20">ERC1155</Badge>
                </div>
                <p className="text-muted-foreground">
                  Tokenized real estate properties on the blockchain
                </p>
              </div>
              <Activity className="w-12 h-12 text-accent opacity-50" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-accent" />
                  <p className="text-sm text-muted-foreground font-medium">Holders</p>
                </div>
                <p className="text-3xl font-bold gradient-text">
                  {nftStats ? formatNumber(nftStats.holderCount) : 'Loading...'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-primary" />
                  <p className="text-sm text-muted-foreground font-medium">Properties</p>
                </div>
                <p className="text-3xl font-bold gradient-text">
                  {nftStats ? formatNumber(nftStats.holderCount) : 'Loading...'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-muted-foreground font-medium">Transfers</p>
                </div>
                <p className="text-3xl font-bold text-green-500">
                  {nftStats ? formatNumber(nftStats.transferCount) : 'Loading...'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <p className="text-sm text-muted-foreground font-medium">Standard</p>
                </div>
                <p className="text-2xl font-bold text-accent">ERC-1155</p>
              </div>
            </div>

            {/* Contract Address */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground font-medium mb-2">Contract Address</p>
              <Link
                to={`/address/${MARKETPLACE}`}
                className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-primary break-all">
                    {MARKETPLACE}
                  </code>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-2" />
                </div>
              </Link>
            </div>

            {/* Top Holders Preview */}
            {nftStats && nftStats.topHolders && nftStats.topHolders.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold">Top Property Holders</h3>
                  <Link to={`/token/${MARKETPLACE}/holders`}>
                    <Button variant="ghost" size="sm" className="text-primary">
                      View All
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-2">
                  {nftStats.topHolders.slice(0, 3).map((holder, idx) => (
                    <Link
                      key={`${holder.holder_address}-${holder.token_id}`}
                      to={`/address/${holder.holder_address}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-accent">#{idx + 1}</span>
                        </div>
                        <div>
                          <code className="text-sm font-mono text-primary block">
                            {holder.holder_address.substring(0, 10)}...{holder.holder_address.substring(38)}
                          </code>
                          {holder.token_id && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Property #{holder.token_id}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatNumber(holder.balance)} shares
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link to={`/token/${MARKETPLACE}/holders`} className="flex-1">
                <Button className="w-full gradient-primary text-white">
                  <Users className="w-4 h-4 mr-2" />
                  View All Holders
                </Button>
              </Link>
              <Link to={`/address/${MARKETPLACE}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Contract Details
                </Button>
              </Link>
            </div>
          </GradientCard>
        </div>

        {/* Info Banner */}
        <GradientCard className="p-6">
          <div className="flex items-start gap-4">
            <Activity className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold mb-2">Real-Time Token Analytics</h3>
              <p className="text-muted-foreground">
                All token holder data and transfer activity is indexed in real-time from the blockchain.
                Click "View All Holders" to see the complete breakdown of token distribution and transfer history.
              </p>
            </div>
          </div>
        </GradientCard>
      </div>
    </div>
  );
}
