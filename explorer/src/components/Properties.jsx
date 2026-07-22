import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Home, Users, TrendingUp, Calendar, DollarSign, MapPin, Bed, Bath, Car, ArrowLeft } from 'lucide-react';
import { GradientCard } from '@/components/ui/gradient-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/utils/api';
import { fetchPropertyMetadata } from '@/utils/propertyMetadata';
import { formatAddress, formatEther, formatNumber } from '@/utils/formatters';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [expandedProperty, setExpandedProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const MARKETPLACE = '0x254dffcd3277c0b1660f6d42efbb754edababc2b';
  const TREASURY_ADDRESSES = [
    '0x712820b679400dacbb5c9eeccfb785378fc9b9b6', // Treasury/Marketplace wallet holding unsold shares
  ];

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    setLoading(true);
    try {
      // Get all property holders (NFTs)
      const response = await api.getTokenHolders(MARKETPLACE, 1, 1000);
      const holders = response.holders || [];

      // Get unique token IDs (properties)
      const tokenIds = [...new Set(holders.filter(h => h.token_id).map(h => h.token_id))];

      // Fetch metadata and calculate stats for each property
      const propertiesData = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const metadata = await fetchPropertyMetadata(parseInt(tokenId));

          // Get holders for this specific property
          const propertyHolders = holders.filter(h => h.token_id === tokenId);

          // Separate actual investors from treasury/marketplace wallets
          const actualInvestors = propertyHolders.filter(h =>
            !TREASURY_ADDRESSES.includes(h.holder_address.toLowerCase())
          );
          const totalRaised = actualInvestors.reduce((sum, h) => sum + parseFloat(h.balance), 0);

          // Calculate funding progress
          const totalShares = metadata.totalShares || 900000;
          const fundingPercentage = (totalRaised / totalShares * 100).toFixed(2);
          const remainingShares = totalShares - totalRaised;

          // Fetch transfer history for this token to get dates
          const transfersResponse = await fetch(`https://explorer.firstbrick.cloud/api/tokens/R{MARKETPLACE}/transfers?tokenId=R{tokenId}`);
          const transfersData = await transfersResponse.json().catch(() => ({ transfers: [] }));
          const transfers = transfersData.transfers || [];

          // Get first and last transfer dates
          let firstTransferDate = null;
          let lastTransferDate = null;
          let totalTransfers = 0;

          if (transfers.length > 0) {
            // Sort by timestamp
            const sortedTransfers = transfers.sort((a, b) => a.timestamp - b.timestamp);
            firstTransferDate = sortedTransfers[0].timestamp;
            lastTransferDate = sortedTransfers[sortedTransfers.length - 1].timestamp;
            totalTransfers = transfers.length;
          }

          return {
            tokenId,
            metadata,
            holders: actualInvestors, // Only actual investors, not treasury
            allHolders: propertyHolders, // All holders including treasury for reference
            transfers: {
              total: totalTransfers,
              firstDate: firstTransferDate,
              lastDate: lastTransferDate,
            },
            stats: {
              totalHolders: actualInvestors.length, // Count only actual investors
              totalRaised,
              totalShares,
              fundingPercentage,
              remainingShares,
              sharePrice: metadata.propertyValue ? (metadata.propertyValue / totalShares).toFixed(2) : 1,
              totalValue: metadata.propertyValue || totalShares,
            }
          };
        })
      );

      // Sort by token ID
      propertiesData.sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId));
      setProperties(propertiesData);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleProperty(tokenId) {
    setExpandedProperty(expandedProperty === tokenId ? null : tokenId);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-4">
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
            FirstBrick Properties
          </h1>
          <p className="text-muted-foreground text-lg">
            Real estate investment opportunities on the blockchain
          </p>
        </div>

        {/* Properties Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GradientCard className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Home className="w-8 h-8 text-primary" />
              <h3 className="text-lg font-semibold">Total Properties</h3>
            </div>
            <p className="text-4xl font-bold gradient-text">
              {properties.length}
            </p>
          </GradientCard>

          <GradientCard className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-8 h-8 text-accent" />
              <h3 className="text-lg font-semibold">Total Investors</h3>
            </div>
            <p className="text-4xl font-bold gradient-text">
              {properties.length > 0 ? [...new Set(properties.flatMap(p => p.holders.map(h => h.holder_address)))].length : 0}
            </p>
          </GradientCard>

          <GradientCard className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-8 h-8 text-green-500" />
              <h3 className="text-lg font-semibold">Total Raised</h3>
            </div>
            <p className="text-4xl font-bold gradient-text">
              R{formatNumber(properties.reduce((sum, p) => sum + p.stats.totalRaised, 0))}
            </p>
          </GradientCard>

          <GradientCard className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <h3 className="text-lg font-semibold">Avg Funding</h3>
            </div>
            <p className="text-4xl font-bold gradient-text">
              {properties.length > 0
                ? (properties.reduce((sum, p) => sum + parseFloat(p.stats.fundingPercentage), 0) / properties.length).toFixed(1)
                : 0}%
            </p>
          </GradientCard>
        </div>

        {/* Properties List */}
        <div className="space-y-4">
          {properties.map((property) => {
            const isExpanded = expandedProperty === property.tokenId;
            const { metadata, stats, holders, transfers } = property;

            return (
              <GradientCard key={property.tokenId} className="overflow-hidden">
                {/* Property Header - Always Visible */}
                <div
                  className="p-6 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => toggleProperty(property.tokenId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1">
                      {/* Property Image */}
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex-shrink-0">
                        <img
                          src={metadata.image}
                          alt={metadata.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/brick-logo.png';
                          }}
                        />
                      </div>

                      {/* Property Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold gradient-text">
                            Property #{property.tokenId}
                          </h3>
                          <Badge className={
                            parseFloat(stats.fundingPercentage) >= 100
                              ? 'bg-green-500/10 text-green-500 border-green-500/20'
                              : parseFloat(stats.fundingPercentage) >= 50
                              ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                              : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }>
                            {parseFloat(stats.fundingPercentage) >= 100 ? 'Fully Funded' : `R{stats.fundingPercentage}% Funded`}
                          </Badge>
                        </div>
                        <p className="text-lg font-semibold mb-1">{metadata.name}</p>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{metadata.location}</span>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-6 mt-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{stats.totalHolders} Investors</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium">R{formatNumber(stats.totalValue)}</span>
                          </div>
                          {metadata.stats?.bedrooms && (
                            <div className="flex items-center gap-2">
                              <Bed className="w-4 h-4 text-accent" />
                              <span className="text-sm">{metadata.stats.bedrooms} Bed</span>
                            </div>
                          )}
                          {metadata.stats?.bathrooms && (
                            <div className="flex items-center gap-2">
                              <Bath className="w-4 h-4 text-accent" />
                              <span className="text-sm">{metadata.stats.bathrooms} Bath</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expand Button */}
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6" />
                      ) : (
                        <ChevronDown className="w-6 h-6" />
                      )}
                    </Button>
                  </div>

                  {/* Funding Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Funding Progress</span>
                      <span className="font-semibold">{formatNumber(stats.totalRaised)} / {formatNumber(stats.totalShares)} shares</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `R{Math.min(stats.fundingPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {/* Detailed Property Information */}
                    <div className="p-6 bg-muted/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column - Property Details */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                              <Home className="w-5 h-5 text-primary" />
                              Property Details
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between p-3 bg-background rounded-lg">
                                <span className="text-muted-foreground">Property Type</span>
                                <span className="font-semibold">{metadata.type}</span>
                              </div>
                              <div className="flex justify-between p-3 bg-background rounded-lg">
                                <span className="text-muted-foreground">Total Value</span>
                                <span className="font-bold gradient-text">R{formatNumber(stats.totalValue)}</span>
                              </div>
                              <div className="flex justify-between p-3 bg-background rounded-lg">
                                <span className="text-muted-foreground">Share Price</span>
                                <span className="font-semibold">R{stats.sharePrice}</span>
                              </div>
                              <div className="flex justify-between p-3 bg-background rounded-lg">
                                <span className="text-muted-foreground">Total Shares</span>
                                <span className="font-semibold">{formatNumber(stats.totalShares)}</span>
                              </div>
                              {metadata.stats?.monthlyRepayment && (
                                <div className="flex justify-between p-3 bg-background rounded-lg">
                                  <span className="text-muted-foreground">Monthly Repayment</span>
                                  <span className="font-semibold">{metadata.stats.monthlyRepayment}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Property Features */}
                          {metadata.features && metadata.features.length > 0 && (
                            <div>
                              <h4 className="text-lg font-bold mb-3">Features</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {metadata.features.map((feature, idx) => (
                                  <Badge key={idx} variant="outline" className="justify-center py-2">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Column - Funding & Returns */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-green-500" />
                              Funding Status
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between p-3 bg-background rounded-lg">
                                <span className="text-muted-foreground">Shares Sold</span>
                                <span className="font-bold text-green-500">{formatNumber(stats.totalRaised)}</span>
                              </div>
                              <div className="flex justify-between p-3 bg-background rounded-lg">
                                <span className="text-muted-foreground">Shares Remaining</span>
                                <span className="font-semibold">{formatNumber(stats.remainingShares)}</span>
                              </div>
                              <div className="flex justify-between p-3 bg-background rounded-lg">
                                <span className="text-muted-foreground">Funding Progress</span>
                                <span className="font-bold gradient-text">{stats.fundingPercentage}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Investor Returns */}
                          <div>
                            <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-accent" />
                              Investor Returns
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between p-3 bg-background rounded-lg">
                                <span className="text-muted-foreground">Total Dividends Paid</span>
                                <span className="font-bold text-green-500">R0.00</span>
                              </div>
                              <div className="flex justify-between p-3 bg-background rounded-lg">
                                <span className="text-muted-foreground">Last Dividend Date</span>
                                <span className="font-semibold text-muted-foreground">Not yet distributed</span>
                              </div>
                              <div className="flex justify-between p-3 bg-background rounded-lg">
                                <span className="text-muted-foreground">Estimated Annual Yield</span>
                                <span className="font-semibold">TBA</span>
                              </div>
                              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                  <strong>Note:</strong> Returns will be distributed once the property is fully funded and operational.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Important Dates */}
                          <div>
                            <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-primary" />
                              Important Dates
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between p-3 bg-background rounded-lg">
                                <span className="text-muted-foreground">First Transfer</span>
                                <span className="font-semibold">
                                  {transfers.firstDate
                                    ? new Date(transfers.firstDate * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                    : 'No transfers yet'}
                                </span>
                              </div>
                              <div className="flex justify-between p-3 bg-background rounded-lg">
                                <span className="text-muted-foreground">Latest Activity</span>
                                <span className="font-semibold">
                                  {transfers.lastDate
                                    ? new Date(transfers.lastDate * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                    : 'No activity'}
                                </span>
                              </div>
                              <div className="flex justify-between p-3 bg-background rounded-lg">
                                <span className="text-muted-foreground">Total Transfers</span>
                                <span className="font-semibold">{formatNumber(transfers.total)}</span>
                              </div>
                              <div className="flex justify-between p-3 bg-background rounded-lg">
                                <span className="text-muted-foreground">Funding Status</span>
                                <span className="font-semibold">
                                  {parseFloat(stats.fundingPercentage) >= 100
                                    ? '✓ Fully Funded'
                                    : `R{stats.fundingPercentage}% Complete`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Property Description */}
                      {metadata.description && (
                        <div className="mt-6">
                          <h4 className="text-lg font-bold mb-3">About This Property</h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {metadata.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Top Investors */}
                    <div className="p-6">
                      <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Top Investors ({holders.length} total)
                      </h4>
                      <div className="space-y-2">
                        {holders.slice(0, 10).map((holder, idx) => {
                          const percentage = (parseFloat(holder.balance) / stats.totalShares * 100).toFixed(2);
                          return (
                            <div
                              key={holder.holder_address}
                              className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-bold text-primary">#{idx + 1}</span>
                                </div>
                                <Link
                                  to={`/address/R{holder.holder_address}`}
                                  className="font-mono text-sm text-primary hover:underline"
                                >
                                  {formatAddress(holder.holder_address)}
                                </Link>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">{formatNumber(holder.balance)} shares</p>
                                <p className="text-xs text-muted-foreground">{percentage}% ownership</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {holders.length > 10 && (
                        <p className="text-center text-muted-foreground text-sm mt-4">
                          Showing top 10 of {holders.length} investors
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </GradientCard>
            );
          })}
        </div>

        {properties.length === 0 && !loading && (
          <GradientCard className="p-12 text-center">
            <Home className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">No Properties Available</h3>
            <p className="text-muted-foreground">
              Properties will appear here once they are listed on the blockchain.
            </p>
          </GradientCard>
        )}
      </div>
    </div>
  );
}
