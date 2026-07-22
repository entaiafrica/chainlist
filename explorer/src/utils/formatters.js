import { ethers } from 'ethers';
import { formatDistanceToNow, format, formatDistance } from 'date-fns';

/**
 * Format Ethereum address to shortened version
 * @param {string} address - Full address
 * @param {number} startChars - Characters to show at start (default: 6)
 * @param {number} endChars - Characters to show at end (default: 4)
 * @returns {string} Formatted address
 */
export function formatAddress(address, startChars = 6, endChars = 4) {
  if (!address) return '';
  if (address.length < startChars + endChars) return address;
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
}

/**
 * Format transaction hash to shortened version
 * @param {string} hash - Full hash
 * @param {number} chars - Characters to show on each side (default: 8)
 * @returns {string} Formatted hash
 */
export function formatHash(hash, chars = 8) {
  if (!hash) return '';
  if (hash.length < chars * 2) return hash;
  return `${hash.substring(0, chars + 2)}...${hash.substring(hash.length - chars)}`;
}

/**
 * Format Wei/BigNumber to Ether with proper decimals
 * @param {string|bigint|number} value - Wei value
 * @param {number} decimals - Decimal places to show (default: 4)
 * @returns {string} Formatted ether value
 */
export function formatEther(value, decimals = 4) {
  if (!value) return '0';
  try {
    const formatted = ethers.formatEther(value);
    const num = parseFloat(formatted);

    // If very small number, show scientific notation
    if (num > 0 && num < 0.0001) {
      return num.toExponential(2);
    }

    // Otherwise show with fixed decimals
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  } catch (error) {
    return '0';
  }
}

/**
 * Format Wei/BigNumber to BRK token amount (18 decimals)
 * @param {string|bigint|number} value - Wei value
 * @param {number} decimals - Decimal places to show (default: 2)
 * @returns {string} Formatted BRK value
 */
export function formatBRK(value, decimals = 2) {
  return formatEther(value, decimals);
}

/**
 * Format number with thousand separators
 * @param {number|string} value - Number to format
 * @param {number} decimals - Decimal places (default: 0)
 * @returns {string} Formatted number
 */
export function formatNumber(value, decimals = 0) {
  if (!value && value !== 0) return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
}

/**
 * Format gas value with proper suffix
 * @param {string|bigint|number} value - Gas value
 * @returns {string} Formatted gas (e.g., "21,000 gas")
 */
export function formatGas(value) {
  if (!value) return '0 gas';
  const num = typeof value === 'bigint' ? Number(value) : parseInt(value);
  return `${formatNumber(num)} gas`;
}

/**
 * Format Unix timestamp to relative time (e.g., "5 minutes ago")
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Relative time string
 */
export function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Unknown';
  try {
    const date = new Date(timestamp * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return 'Unknown';
  }
}

/**
 * Format Unix timestamp to full date string
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {string} formatString - Date format (default: 'PPpp')
 * @returns {string} Formatted date string
 */
export function formatTimestamp(timestamp, formatString = 'PPpp') {
  if (!timestamp) return 'Unknown';
  try {
    const date = new Date(timestamp * 1000);
    return format(date, formatString);
  } catch (error) {
    return 'Unknown';
  }
}

/**
 * Format Unix timestamp to short date (e.g., "Jan 15, 2026")
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Short date string
 */
export function formatDateShort(timestamp) {
  return formatTimestamp(timestamp, 'MMM dd, yyyy');
}

/**
 * Format Unix timestamp to date and time (e.g., "Jan 15, 2026 3:45 PM")
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Date and time string
 */
export function formatDateTime(timestamp) {
  return formatTimestamp(timestamp, 'MMM dd, yyyy h:mm a');
}

/**
 * Format Unix timestamp to ISO 8601 format (for exports)
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} ISO format date string
 */
export function formatISO(timestamp) {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp * 1000);
    return date.toISOString();
  } catch (error) {
    return '';
  }
}

/**
 * Format block time difference
 * @param {number} timestamp1 - First timestamp (seconds)
 * @param {number} timestamp2 - Second timestamp (seconds)
 * @returns {string} Time difference (e.g., "2 minutes")
 */
export function formatBlockTime(timestamp1, timestamp2) {
  if (!timestamp1 || !timestamp2) return 'Unknown';
  try {
    const date1 = new Date(timestamp1 * 1000);
    const date2 = new Date(timestamp2 * 1000);
    return formatDistance(date1, date2);
  } catch (error) {
    return 'Unknown';
  }
}

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 2) {
  if (!value && value !== 0) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Parse and validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid address
 */
export function isValidAddress(address) {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Parse and validate transaction hash
 * @param {string} hash - Hash to validate
 * @returns {boolean} True if valid hash
 */
export function isValidHash(hash) {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Parse and validate block number
 * @param {string} value - Value to validate
 * @returns {boolean} True if valid block number
 */
export function isValidBlockNumber(value) {
  const num = parseInt(value);
  return !isNaN(num) && num >= 0;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback method
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  }
}

/**
 * Format transaction type based on data
 * @param {object} tx - Transaction object
 * @returns {string} Transaction type
 */
export function getTxType(tx) {
  if (!tx) return 'Unknown';
  if (!tx.to) return 'Contract Creation';
  if (tx.value && tx.value !== '0') return 'Transfer';
  if (tx.input_data && tx.input_data !== '0x') return 'Contract Call';
  return 'Transaction';
}

/**
 * Format status badge color
 * @param {number} status - Transaction status (1 = success, 0 = failed)
 * @returns {string} Color class
 */
export function getStatusColor(status) {
  return status === 1 ? 'tx-success' : 'tx-failed';
}

/**
 * Get short transaction status
 * @param {number} status - Transaction status
 * @returns {string} Status text
 */
export function getStatusText(status) {
  return status === 1 ? 'Success' : 'Failed';
}
