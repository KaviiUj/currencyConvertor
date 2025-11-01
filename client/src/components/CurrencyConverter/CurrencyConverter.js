import React, { useState, useEffect } from 'react';
import CurrencyConverterModel from '../../models/CurrencyConverter';
import CurrencyDropdown from '../CurrencyDropdown/CurrencyDropdown';
import { getCurrencyByCode } from '../../data/currencies';
import { fetchExchangeRates } from '../../services/exchangeRateService';
import './CurrencyConverter.css';

const CurrencyConverter = ({ onConversionChange }) => {
  const [sendAmount, setSendAmount] = useState(1);
  const [receiveAmount, setReceiveAmount] = useState(0);
  const [sendCurrency, setSendCurrency] = useState('USD');
  const [receiveCurrency, setReceiveCurrency] = useState('MXN');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [actualExchangeRate, setActualExchangeRate] = useState(0); // Rate with specialRate applied
  const [previousExchangeRate, setPreviousExchangeRate] = useState(0);
  const [exchangeRateData, setExchangeRateData] = useState(null); // Store full exchange rate response
  const [fee, setFee] = useState(0); // Default to 0
  const [previousFee] = useState(1.99);
  const [feeDiscount] = useState(100);
  const [deliveryTime] = useState('In minutes');
  const [showPromoBanner] = useState(true);
  const [promoMessage] = useState('Get a 0 USD transfer fee* on your first online transfer!');
  const [specialRate, setSpecialRate] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  const [lastChanged, setLastChanged] = useState('send'); // 'send' or 'receive'
  const [sendDropdownOpen, setSendDropdownOpen] = useState(false);
  const [receiveDropdownOpen, setReceiveDropdownOpen] = useState(false);

  // Load config from localStorage or fetch from API
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // First check localStorage
        const storedConfig = localStorage.getItem('config');
        if (storedConfig) {
          const config = JSON.parse(storedConfig);
          setFee(config.ourFee || 0);
          const specialRateValue = config.specialRate || 0;
          setSpecialRate(specialRateValue > 0 ? specialRateValue : null);
          setConfigLoading(false);
          return;
        }

        // If not in localStorage, fetch from API
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setConfigLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5001/api/config', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.config) {
            // Store in localStorage for future use
            localStorage.setItem('config', JSON.stringify(data.config));
            setFee(data.config.ourFee || 0);
            const specialRateValue = data.config.specialRate || 0;
            setSpecialRate(specialRateValue > 0 ? specialRateValue : null);
          } else {
            // Default to 0 if no config
            setFee(0);
            setSpecialRate(null);
            localStorage.setItem('config', JSON.stringify({ ourFee: 0, specialRate: 0 }));
          }
        } else {
          // Default to 0 on API error
          setFee(0);
          setSpecialRate(null);
          localStorage.setItem('config', JSON.stringify({ ourFee: 0, specialRate: 0 }));
        }
      } catch (error) {
        console.error('Error loading config:', error);
        // Default to 0 on error
        setFee(0);
        setSpecialRate(null);
        localStorage.setItem('config', JSON.stringify({ ourFee: 0, specialRate: 0 }));
      } finally {
        setConfigLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Fetch exchange rates when sending currency changes (including initial load)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const exchangeRateResponse = await fetchExchangeRates(sendCurrency);
        
        // Store the full exchange rate data
        setExchangeRateData(exchangeRateResponse);
        
        // Get rate for current receiver currency
        const rate = exchangeRateResponse.getRate(receiveCurrency);
        
        if (rate !== null) {
          // Store previous rate before updating
          setPreviousExchangeRate(exchangeRate);
          setExchangeRate(rate);
          
          // Calculate actual rate with specialRate if applicable (specialRate is percentage)
          let actualRate = rate;
          if (specialRate && specialRate > 0) {
            // Apply specialRate as percentage: actualRate = rate * (1 + specialRate / 100)
            actualRate = rate * (1 + specialRate / 100);
            setActualExchangeRate(actualRate);
          } else {
            setActualExchangeRate(rate);
          }
          
          // Always calculate receiver amount based on current send amount using actual rate
          const tempConverter = new CurrencyConverterModel({ exchangeRate: actualRate });
          const calculated = tempConverter.calculateReceiveAmount(sendAmount, actualRate);
          setReceiveAmount(calculated);
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      }
    };

    if (sendCurrency) {
      fetchRates();
    }
  }, [sendCurrency, specialRate]); // Fetch when sending currency or specialRate changes

  // Notify parent component when conversion data changes
  useEffect(() => {
    if (onConversionChange && sendCurrency && receiveCurrency) {
      onConversionChange({
        sendCurrency,
        receiveCurrency,
        sendAmount,
        receiveAmount,
        exchangeRate: actualExchangeRate
      });
    }
  }, [sendCurrency, receiveCurrency, sendAmount, receiveAmount, actualExchangeRate, onConversionChange]);

  // Create converter model instance for calculations
  const converter = new CurrencyConverterModel({
    sendAmount,
    sendCurrency,
    receiveAmount,
    receiveCurrency,
    exchangeRate,
    previousExchangeRate,
    fee,
    previousFee,
    feeDiscount,
    deliveryTime,
    showPromoBanner,
    promoMessage
  });

  // Update receive amount when send amount changes
  useEffect(() => {
    const rateToUse = actualExchangeRate > 0 ? actualExchangeRate : exchangeRate;
    if (lastChanged === 'send' && sendAmount > 0 && rateToUse > 0) {
      const tempConverter = new CurrencyConverterModel({ exchangeRate: rateToUse });
      const calculated = tempConverter.calculateReceiveAmount(sendAmount, rateToUse);
      setReceiveAmount(calculated);
    } else if (sendAmount === 0) {
      setReceiveAmount(0);
    }
  }, [sendAmount, exchangeRate, actualExchangeRate, lastChanged]);

  // Update send amount when receive amount changes
  useEffect(() => {
    if (lastChanged === 'receive' && receiveAmount >= 0) {
      const tempConverter = new CurrencyConverterModel({ exchangeRate });
      const calculated = tempConverter.calculateSendAmount(receiveAmount, exchangeRate);
      setSendAmount(calculated);
    }
  }, [receiveAmount, exchangeRate, lastChanged]);

  const handleSendAmountChange = (e) => {
    const value = parseFloat(e.target.value);
    if (value > 0) {
      setSendAmount(value);
      setLastChanged('send');
    } else if (e.target.value === '' || value === 0) {
      // If empty or 0, set to 1 as default
      setSendAmount(1);
      setLastChanged('send');
    }
  };

  const handleReceiveAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    if (value > 0) {
      setReceiveAmount(value);
      setLastChanged('receive');
    } else {
      setReceiveAmount(0);
      setLastChanged('receive');
    }
  };

  const handleSendCurrencyChange = (currencyCode) => {
    setSendCurrency(currencyCode);
    setSendDropdownOpen(false);
    // Exchange rates will be fetched automatically by useEffect when sendCurrency changes
  };

  const handleReceiveCurrencyChange = (currencyCode) => {
    setReceiveCurrency(currencyCode);
    setReceiveDropdownOpen(false);
    
    // Use already fetched exchange rates (no API call needed)
    if (exchangeRateData) {
      const rate = exchangeRateData.getRate(currencyCode);
      
      if (rate !== null) {
        // Store previous rate before updating
        setPreviousExchangeRate(exchangeRate);
        setExchangeRate(rate);
        
        // Calculate actual rate with specialRate if applicable (specialRate is percentage)
        let actualRate = rate;
        if (specialRate && specialRate > 0) {
          // Apply specialRate as percentage: actualRate = rate * (1 + specialRate / 100)
          actualRate = rate * (1 + specialRate / 100);
          setActualExchangeRate(actualRate);
        } else {
          setActualExchangeRate(rate);
        }
        
        // Always update receive amount based on current send amount using actual rate
        const tempConverter = new CurrencyConverterModel({ exchangeRate: actualRate });
        const calculated = tempConverter.calculateReceiveAmount(sendAmount, actualRate);
        setReceiveAmount(calculated);
      }
    }
  };

  const handleSendNow = () => {
    // TODO: Implement send functionality
    console.log('Send now:', converter.toJSON());
  };

  const sendCurrencyData = getCurrencyByCode(sendCurrency);
  const receiveCurrencyData = getCurrencyByCode(receiveCurrency);

  return (
    <div className="currency-converter">
      <div className="converter-card">
        <div className="converter-section">
          <label className="converter-label">You're sending</label>
          <div className="converter-input-group">
            <input
              type="number"
              className="converter-input"
              value={sendAmount}
              onChange={handleSendAmountChange}
              min="1"
              step="0.01"
            />
            <div className="converter-currency-selector-wrapper">
              <button
                className="currency-selector-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setReceiveDropdownOpen(false);
                  setSendDropdownOpen(!sendDropdownOpen);
                }}
                type="button"
              >
                <span className="currency-flag">{sendCurrencyData?.flag || '🌍'}</span>
                <span className="currency-code">{sendCurrency}</span>
                <span className="currency-chevron">▼</span>
              </button>
            </div>
          </div>
          {sendDropdownOpen && (
            <div className="currency-dropdown-absolute-wrapper">
              <CurrencyDropdown
                selectedCurrency={sendCurrency}
                onSelect={handleSendCurrencyChange}
                isOpen={sendDropdownOpen}
                onClose={() => setSendDropdownOpen(false)}
                position="bottom"
              />
            </div>
          )}
        </div>

        <div className="converter-section">
          <label className="converter-label">Your receiver gets</label>
          <div className="converter-input-group">
            <input
              type="number"
              className="converter-input"
              value={receiveAmount > 0 ? receiveAmount.toFixed(2) : ''}
              onChange={handleReceiveAmountChange}
              min="0"
              step="0.01"
            />
            <div className="converter-currency-selector-wrapper">
              <button
                className="currency-selector-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSendDropdownOpen(false);
                  setReceiveDropdownOpen(!receiveDropdownOpen);
                }}
                type="button"
              >
                <span className="currency-flag">{receiveCurrencyData?.flag || '🌍'}</span>
                <span className="currency-code">{receiveCurrency}</span>
                <span className="currency-chevron">▼</span>
              </button>
            </div>
          </div>
          {receiveDropdownOpen && (
            <div className="currency-dropdown-absolute-wrapper">
              <CurrencyDropdown
                selectedCurrency={receiveCurrency}
                onSelect={handleReceiveCurrencyChange}
                isOpen={receiveDropdownOpen}
                onClose={() => setReceiveDropdownOpen(false)}
                position="bottom"
              />
            </div>
          )}
        </div>

            <div className="converter-details">
              <div className="detail-row">
                <span className="detail-label">Exchange rate</span>
                <div className="detail-value-group">
                  {specialRate && specialRate > 0 && exchangeRate > 0 && (
                    <span className="detail-value-strikethrough">
                      {exchangeRate.toFixed(4)} {receiveCurrency}
                    </span>
                  )}
                  <span className="detail-value">
                    {(actualExchangeRate > 0 ? actualExchangeRate : exchangeRate).toFixed(4)} {receiveCurrency}
                  </span>
                </div>
              </div>

              <div className="detail-row">
                <span className="detail-label">Our fees</span>
                <div className="detail-value-group">
                  <span className="detail-value">
                    {fee}% {sendCurrency}
                  </span>
                </div>
              </div>
            </div>

        <div className="converter-divider"></div>

        <div className="converter-total">
          <span className="total-label">Total Amount to Pay</span>
          <span className="total-value">
            {(() => {
              const feeAmount = sendAmount > 0 && fee > 0 ? sendAmount * (fee / 100) : 0;
              return (sendAmount + feeAmount).toFixed(2);
            })()} {sendCurrency}
          </span>
        </div>

        <div className="converter-total">
          <span className="total-label">Receiver Amount</span>
          <span className="total-value">
            {receiveAmount > 0 ? receiveAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0.00'} {receiveCurrency}
          </span>
        </div>

      </div>
    </div>
  );
};

export default CurrencyConverter;



