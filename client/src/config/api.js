/**
 * API Configuration
 * Centralized configuration for API endpoints and keys
 */

export const API_CONFIG = {
  BASE_URL: 'http://localhost:5001',
  EXCHANGE_RATE_API: {
    BASE_URL: 'https://v6.exchangerate-api.com/v6',
    API_KEY: '94e0d2273a2f259d8a417a4a',
    ENDPOINT: 'latest'
  }
};

/**
 * Get exchange rate API URL for a given base currency
 * @param {string} baseCurrency - Base currency code (e.g., 'USD')
 * @returns {string} Full API URL
 */
export const getExchangeRateAPIUrl = (baseCurrency) => {
  const { BASE_URL, API_KEY, ENDPOINT } = API_CONFIG.EXCHANGE_RATE_API;
  return `${BASE_URL}/${API_KEY}/${ENDPOINT}/${baseCurrency}`;
};

