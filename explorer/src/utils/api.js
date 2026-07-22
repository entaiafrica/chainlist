// API client for FirstBrick Explorer Indexer
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://explorer.firstbrick.cloud/api'
  : 'http://localhost:8550/api';

class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error.message);
      throw error;
    }
  }

  // Blocks
  async getBlocks(page = 1, limit = 25) {
    return this.request(`/blocks?page=${page}&limit=${limit}`);
  }

  async getBlock(number) {
    return this.request(`/blocks/${number}`);
  }

  async getBlockByHash(hash) {
    return this.request(`/blocks/hash/${hash}`);
  }

  async getLatestBlock() {
    return this.request(`/blocks/latest`);
  }

  // Transactions
  async getTransactions(page = 1, limit = 25, status = null) {
    let url = `/transactions?page=${page}&limit=${limit}`;
    if (status !== null) url += `&status=${status}`;
    return this.request(url);
  }

  async getTransaction(hash) {
    return this.request(`/transactions/${hash}`);
  }

  async getTransactionsByAddress(address, page = 1, limit = 25, type = 'all') {
    return this.request(`/transactions/address/${address}?page=${page}&limit=${limit}&type=${type}`);
  }

  // Addresses
  async getAddress(address) {
    return this.request(`/addresses/${address}`);
  }

  async getAddressTransactions(address, page = 1, limit = 25, type = 'all') {
    return this.request(`/addresses/${address}/transactions?page=${page}&limit=${limit}&type=${type}`);
  }

  async getAddressTokens(address) {
    return this.request(`/addresses/${address}/tokens`);
  }

  // Search
  async search(query) {
    return this.request(`/search?q=${encodeURIComponent(query)}`);
  }

  // Stats
  async getStats() {
    return this.request('/stats');
  }

  // Tokens
  async getTokenHolders(tokenAddress, page = 1, limit = 50) {
    return this.request(`/tokens/${tokenAddress}/holders?page=${page}&limit=${limit}`);
  }

  async getTokenStats(tokenAddress) {
    return this.request(`/tokens/${tokenAddress}/stats`);
  }

  async getTokenTransfers(tokenAddress, page = 1, limit = 25) {
    return this.request(`/tokens/${tokenAddress}/transfers?page=${page}&limit=${limit}`);
  }

  // Health check
  async getHealth() {
    return this.request('/health', { baseUrl: this.baseUrl.replace('/api', '') });
  }
}

const api = new ApiClient();

export default api;
