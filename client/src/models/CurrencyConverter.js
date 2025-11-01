/**
 * Currency Converter Model
 * Represents the data structure for currency conversion
 */
class CurrencyConverter {
  constructor(data = {}) {
    this.sendAmount = data.sendAmount || 0;
    this.sendCurrency = data.sendCurrency || 'USD';
    this.receiveAmount = data.receiveAmount || 0;
    this.receiveCurrency = data.receiveCurrency || 'MXN';
    this.exchangeRate = data.exchangeRate || 0;
    this.previousExchangeRate = data.previousExchangeRate || 0;
    this.fee = data.fee || 0;
    this.previousFee = data.previousFee || 0;
    this.feeDiscount = data.feeDiscount || 0; // Percentage discount (0-100)
    this.deliveryTime = data.deliveryTime || 'In minutes';
    this.showPromoBanner = data.showPromoBanner !== undefined ? data.showPromoBanner : true;
    this.promoMessage = data.promoMessage || 'Get a 0 USD transfer fee* on your first online transfer!';
  }

  /**
   * Calculate receive amount based on send amount and exchange rate
   * @param {number} amount - Amount to send
   * @param {number} rate - Exchange rate
   * @returns {number} Calculated receive amount
   */
  calculateReceiveAmount(amount, rate) {
    return parseFloat((amount * rate).toFixed(2));
  }

  /**
   * Calculate send amount based on receive amount and exchange rate
   * @param {number} amount - Amount to receive
   * @param {number} rate - Exchange rate
   * @returns {number} Calculated send amount
   */
  calculateSendAmount(amount, rate) {
    return parseFloat((amount / rate).toFixed(2));
  }

  /**
   * Get total amount including fees
   * @returns {number} Total amount
   */
  getTotalAmount() {
    return this.feeDiscount >= 100 ? this.sendAmount : this.sendAmount + this.fee;
  }

  /**
   * Get fee discount percentage text
   * @returns {string} Discount text (e.g., "100% off")
   */
  getFeeDiscountText() {
    if (this.feeDiscount >= 100) {
      return '100% off';
    } else if (this.feeDiscount > 0) {
      return `${this.feeDiscount}% off`;
    }
    return '';
  }

  /**
   * Get fee amount after discount
   * @returns {number} Fee after discount
   */
  getFinalFee() {
    if (this.feeDiscount >= 100) {
      return 0;
    }
    return parseFloat((this.fee * (1 - this.feeDiscount / 100)).toFixed(2));
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      sendAmount: this.sendAmount,
      sendCurrency: this.sendCurrency,
      receiveAmount: this.receiveAmount,
      receiveCurrency: this.receiveCurrency,
      exchangeRate: this.exchangeRate,
      previousExchangeRate: this.previousExchangeRate,
      fee: this.fee,
      previousFee: this.previousFee,
      feeDiscount: this.feeDiscount,
      deliveryTime: this.deliveryTime,
      showPromoBanner: this.showPromoBanner,
      promoMessage: this.promoMessage
    };
  }
}

export default CurrencyConverter;

