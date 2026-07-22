import { useState } from 'react';
import { Wallet, Plus, CheckCircle, AlertCircle, Network, Coins } from 'lucide-react';
import { GradientCard } from '@/components/ui/gradient-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function NetworkSetup() {
  const [networkAdded, setNetworkAdded] = useState({ global: false, sa: false });
  const [tokenAdded, setTokenAdded] = useState(false);
  const [loading, setLoading] = useState({ global: false, sa: false, token: false });
  const [error, setError] = useState({ global: null, sa: null, token: null });

  const NETWORK_CONFIG_GLOBAL = {
    chainId: '0x31f2', // 12786 in hex
    chainName: 'FirstBrick Network (Global)',
    nativeCurrency: {
      name: 'BRK',
      symbol: 'BRK',
      decimals: 18
    },
    rpcUrls: ['https://rpc.firstbrick.cloud'],
    blockExplorerUrls: ['https://explorer.firstbrick.cloud']
  };

  const NETWORK_CONFIG_SA = {
    chainId: '0x31f2', // 12786 in hex
    chainName: 'FirstBrick Network (South Africa)',
    nativeCurrency: {
      name: 'BRK',
      symbol: 'BRK',
      decimals: 18
    },
    rpcUrls: ['https://fb-rpc.entailabs.com'],
    blockExplorerUrls: ['https://explorer.firstbrick.cloud']
  };

  const BRK_TOKEN = {
    address: '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24',
    symbol: 'BRK',
    decimals: 18,
    image: 'https://explorer.firstbrick.cloud/brick-logo.png'
  };

  async function addNetwork(type = 'global') {
    const config = type === 'sa' ? NETWORK_CONFIG_SA : NETWORK_CONFIG_GLOBAL;
    setLoading({ ...loading, [type]: true });
    setError({ ...error, [type]: null });

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [config],
      });

      setNetworkAdded({ ...networkAdded, [type]: true });
    } catch (err) {
      console.error('Error adding network:', err);
      if (err.code === 4001) {
        setError({ ...error, [type]: 'User rejected the request' });
      } else {
        setError({ ...error, [type]: err.message });
      }
    } finally {
      setLoading({ ...loading, [type]: false });
    }
  }

  async function addToken() {
    setLoading({ ...loading, token: true });
    setError({ ...error, token: null });

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      // Try to switch to either FirstBrick network (global or SA)
      let switched = false;
      for (const config of [NETWORK_CONFIG_GLOBAL, NETWORK_CONFIG_SA]) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: config.chainId }],
          });
          switched = true;
          break;
        } catch (switchError) {
          // Try next network
          continue;
        }
      }

      // If no network found, prompt to add one
      if (!switched) {
        throw new Error('Please add FirstBrick Network first');
      }

      // Add the token
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: BRK_TOKEN,
        },
      });

      if (wasAdded) {
        setTokenAdded(true);
      }
    } catch (err) {
      console.error('Error adding token:', err);
      if (err.code === 4001) {
        setError({ ...error, token: 'User rejected the request' });
      } else {
        setError({ ...error, token: err.message });
      }
    } finally {
      setLoading({ ...loading, token: false });
    }
  }

  return (
    <GradientCard className="p-6">
      <div className="mb-4">
        <h3 className="text-2xl font-bold gradient-text mb-2 flex items-center gap-2">
          <Wallet className="w-6 h-6" />
          Quick Setup
        </h3>
        <p className="text-muted-foreground text-sm">
          Add FirstBrick Network and BRK Token to your MetaMask wallet
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Add Global Network */}
        <div className="p-4 rounded-lg border border-border bg-muted/20">
          <div className="flex items-center gap-2 mb-3">
            <Network className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Global Network</h4>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Chain ID:</span>
              <code className="font-mono text-xs bg-primary/10 px-2 py-1 rounded">12786</code>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Region:</span>
              <Badge variant="outline" className="text-xs">🌍 Global</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Latency:</span>
              <span className="text-xs">~150-200ms</span>
            </div>
          </div>

          {networkAdded.global ? (
            <Badge className="w-full justify-center bg-green-500/10 text-green-500 border-green-500/20 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              Added
            </Badge>
          ) : (
            <Button
              onClick={() => addNetwork('global')}
              disabled={loading.global}
              className="w-full gradient-primary text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading.global ? 'Adding...' : 'Add Network'}
            </Button>
          )}

          {error.global && (
            <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-500">{error.global}</p>
            </div>
          )}
        </div>

        {/* Add SA Network */}
        <div className="p-4 rounded-lg border border-border bg-muted/20">
          <div className="flex items-center gap-2 mb-3">
            <Network className="w-5 h-5 text-accent" />
            <h4 className="font-semibold">South Africa</h4>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Chain ID:</span>
              <code className="font-mono text-xs bg-accent/10 px-2 py-1 rounded">12786</code>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Region:</span>
              <Badge variant="outline" className="text-xs">🇿🇦 Africa</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Latency:</span>
              <span className="text-xs text-green-500">~10-50ms ⚡</span>
            </div>
          </div>

          {networkAdded.sa ? (
            <Badge className="w-full justify-center bg-green-500/10 text-green-500 border-green-500/20 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              Added
            </Badge>
          ) : (
            <Button
              onClick={() => addNetwork('sa')}
              disabled={loading.sa}
              className="w-full bg-accent hover:bg-accent/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading.sa ? 'Adding...' : 'Add Network'}
            </Button>
          )}

          {error.sa && (
            <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-500">{error.sa}</p>
            </div>
          )}
        </div>

        {/* Add Token */}
        <div className="p-4 rounded-lg border border-border bg-muted/20">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-5 h-5 text-accent" />
            <h4 className="font-semibold">BRK Token</h4>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Symbol:</span>
              <Badge className="gradient-primary text-white">BRK</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Decimals:</span>
              <code className="font-mono text-xs bg-primary/10 px-2 py-1 rounded">18</code>
            </div>
          </div>

          {tokenAdded ? (
            <Badge className="w-full justify-center bg-green-500/10 text-green-500 border-green-500/20 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              Token Added
            </Badge>
          ) : (
            <Button
              onClick={addToken}
              disabled={loading.token}
              className="w-full bg-accent hover:bg-accent/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading.token ? 'Adding...' : 'Add BRK Token'}
            </Button>
          )}

          {error.token && (
            <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-500">{error.token}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-primary">Note:</strong> Choose the network closest to your region for best performance.
            African users should use the South Africa network (10-50ms latency).
            Both networks access the same blockchain data.
          </p>
        </div>
      </div>
    </GradientCard>
  );
}
