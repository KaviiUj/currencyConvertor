import { getExchangeRateAPIUrl } from '../config/api';
import ExchangeRateResponse from '../models/ExchangeRateResponse';

/**
 * Fetch exchange rates from the Exchange Rate API
 * @param {string} baseCurrency - Base currency code (e.g., 'USD')
 * @returns {Promise<ExchangeRateResponse>} Exchange rate response object
 */
export const fetchExchangeRates = async (baseCurrency = 'USD') => {
  try {
    const url = getExchangeRateAPIUrl(baseCurrency);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.status}`);
    }

    const data = await response.json();
    
    // Create ExchangeRateResponse instance
    const exchangeRateResponse = ExchangeRateResponse.fromAPIResponse(data);
    
    if (!exchangeRateResponse.isValid()) {
      throw new Error('Invalid exchange rate response');
    }

    return exchangeRateResponse;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
};

/**
 * Get exchange rate between two currencies
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {string} baseCurrency - Base currency for API call (default: fromCurrency)
 * @returns {Promise<number>} Exchange rate
 */
export const getExchangeRate = async (fromCurrency, toCurrency, baseCurrency = null) => {
  try {
    const base = baseCurrency || fromCurrency;
    const exchangeRateResponse = await fetchExchangeRates(base);
    
    if (fromCurrency === toCurrency) {
      return 1;
    }

    if (base === fromCurrency) {
      // Base is fromCurrency, get rate directly
      const rate = exchangeRateResponse.getRate(toCurrency);
      return rate || 1;
    } else {
      // Need to convert
      return exchangeRateResponse.convertBetween(1, fromCurrency, toCurrency) || 1;
    }
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    throw error;
  }
};

