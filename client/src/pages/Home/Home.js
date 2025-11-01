import React, { useState, useEffect, useCallback } from 'react';
import CurrencyConverter from '../../components/CurrencyConverter/CurrencyConverter';
import TransactionForm from '../../components/TransactionForm/TransactionForm';
import Toast from '../../components/Toast/Toast';
import { api } from '../../utils/apiHandler';
import './Home.css';

const Home = () => {
  const [conversionData, setConversionData] = useState({
    sendingCurrency: '',
    receiveCurrency: '',
    sendingAmount: 0,
    receiveAmount: 0,
    todaysRate: 0
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await api.get('/api/config');
      
      if (data.config) {
        // Update localStorage with latest config
        localStorage.setItem('config', JSON.stringify(data.config));
        console.log('Config updated:', data.config);
      }
    } catch (err) {
      console.error('Error fetching config:', err);
      // Keep using existing config from localStorage if fetch fails
    }
  };

  const handleConversionChange = useCallback((data) => {
    setConversionData({
      sendingCurrency: data.sendCurrency,
      receiveCurrency: data.receiveCurrency,
      sendingAmount: data.sendAmount,
      receiveAmount: data.receiveAmount,
      todaysRate: data.exchangeRate
    });
  }, []);

  const handleTransactionCreated = useCallback((transaction) => {
    setToastMessage('Transaction recorded successfully');
    setShowToast(true);
  }, []);

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []);

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-left">
          <CurrencyConverter onConversionChange={handleConversionChange} />
        </div>
        <div className="home-right">
          <TransactionForm 
            conversionData={conversionData}
            onTransactionCreated={handleTransactionCreated}
          />
        </div>
      </div>

      <Toast
        message={toastMessage}
        show={showToast}
        onClose={handleCloseToast}
      />
    </div>
  );
};

export default Home;

