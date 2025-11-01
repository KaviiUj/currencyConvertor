/**
 * Exchange Rate API Response Model
 * Represents the response structure from the exchange rate API
 */
class ExchangeRateResponse {
  constructor(data) {
    this.result = data.result || '';
    this.documentation = data.documentation || '';
    this.terms_of_use = data.terms_of_use || '';
    this.time_last_update_unix = data.time_last_update_unix || 0;
    this.time_last_update_utc = data.time_last_update_utc || '';
    this.time_next_update_unix = data.time_next_update_unix || 0;
    this.time_next_update_utc = data.time_next_update_utc || '';
    this.base_code = data.base_code || '';
    this.conversion_rates = data.conversion_rates || {};
  }

  /**
   * Validate the response structure
   * @returns {boolean} True if valid, false otherwise
   */
  isValid() {
    return (
      this.result === 'success' &&
      typeof this.documentation === 'string' &&
      typeof this.terms_of_use === 'string' &&
      typeof this.time_last_update_unix === 'number' &&
      typeof this.time_last_update_utc === 'string' &&
      typeof this.time_next_update_unix === 'number' &&
      typeof this.time_next_update_utc === 'string' &&
      typeof this.base_code === 'string' &&
      typeof this.conversion_rates === 'object' &&
      this.conversion_rates !== null
    );
  }

  /**
   * Get conversion rate for a specific currency
   * @param {string} currencyCode - The currency code (e.g., 'EUR', 'GBP')
   * @returns {number|null} The conversion rate or null if not found
   */
  getRate(currencyCode) {
    if (!currencyCode || typeof currencyCode !== 'string') {
      return null;
    }
    return this.conversion_rates[currencyCode.toUpperCase()] || null;
  }

  /**
   * Get all available currency codes
   * @returns {string[]} Array of currency codes
   */
  getAvailableCurrencies() {
    return Object.keys(this.conversion_rates);
  }

  /**
   * Check if a currency code exists in conversion rates
   * @param {string} currencyCode - The currency code to check
   * @returns {boolean} True if exists, false otherwise
   */
  hasCurrency(currencyCode) {
    if (!currencyCode || typeof currencyCode !== 'string') {
      return false;
    }
    return currencyCode.toUpperCase() in this.conversion_rates;
  }

  /**
   * Convert amount from base currency to target currency
   * @param {number} amount - Amount to convert
   * @param {string} targetCurrency - Target currency code
   * @returns {number|null} Converted amount or null if currency not found
   */
  convert(amount, targetCurrency) {
    const rate = this.getRate(targetCurrency);
    if (rate === null || typeof amount !== 'number' || isNaN(amount)) {
      return null;
    }
    return amount * rate;
  }

  /**
   * Convert amount from source currency to target currency
   * @param {number} amount - Amount to convert
   * @param {string} sourceCurrency - Source currency code
   * @param {string} targetCurrency - Target currency code
   * @returns {number|null} Converted amount or null if currencies not found
   */
  convertBetween(amount, sourceCurrency, targetCurrency) {
    if (sourceCurrency.toUpperCase() === this.base_code.toUpperCase()) {
      return this.convert(amount, targetCurrency);
    }
    
    if (targetCurrency.toUpperCase() === this.base_code.toUpperCase()) {
      const sourceRate = this.getRate(sourceCurrency);
      if (sourceRate === null) {
        return null;
      }
      return amount / sourceRate;
    }

    // Convert source to base, then base to target
    const sourceRate = this.getRate(sourceCurrency);
    const targetRate = this.getRate(targetCurrency);
    
    if (sourceRate === null || targetRate === null) {
      return null;
    }
    
    // Convert to base currency first, then to target
    const baseAmount = amount / sourceRate;
    return baseAmount * targetRate;
  }

  /**
   * Get the response as a plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      result: this.result,
      documentation: this.documentation,
      terms_of_use: this.terms_of_use,
      time_last_update_unix: this.time_last_update_unix,
      time_last_update_utc: this.time_last_update_utc,
      time_next_update_unix: this.time_next_update_unix,
      time_next_update_utc: this.time_next_update_utc,
      base_code: this.base_code,
      conversion_rates: this.conversion_rates
    };
  }

  /**
   * Create an instance from API response data
   * @param {Object} apiResponse - Raw API response object
   * @returns {ExchangeRateResponse} New instance
   */
  static fromAPIResponse(apiResponse) {
    return new ExchangeRateResponse(apiResponse);
  }
}

module.exports = ExchangeRateResponse;

