import React, { useState, useEffect } from 'react';
import { api, formatErrorMessage } from '../../utils/apiHandler';
import './TransactionForm.css';

const TransactionForm = ({ conversionData, onTransactionCreated }) => {
  const [formData, setFormData] = useState({
    surname: '',
    fullName: '',
    mobile: '',
    address: '',
    passportNumber: '',
    email: '',
    country: '',
    date: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Set default date to current date/time
  useEffect(() => {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setFormData(prev => ({ ...prev, date: localDateTime }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.surname.trim()) {
      newErrors.surname = 'Surname is required';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.passportNumber.trim()) {
      newErrors.passportNumber = 'Passport number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    // Validate conversion data
    if (!conversionData.sendingCurrency) {
      newErrors.conversion = 'Please select currencies in the converter';
    }

    if (!conversionData.sendingAmount || conversionData.sendingAmount <= 0) {
      newErrors.conversion = 'Please enter a valid sending amount in the converter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Get config from localStorage
      const configStr = localStorage.getItem('config');
      const config = configStr ? JSON.parse(configStr) : { ourFee: 0, specialRate: 0 };

      // Get user info from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};

      // Prepare transaction data
      const transactionData = {
        surname: formData.surname.trim(),
        fullName: formData.fullName.trim(),
        mobile: formData.mobile.trim(),
        address: formData.address.trim(),
        passportNumber: formData.passportNumber.trim(),
        email: formData.email.trim(),
        country: formData.country.trim(),
        sendingCurrency: conversionData.sendingCurrency,
        receiveCurrency: conversionData.receiveCurrency,
        sendingAmount: parseFloat(conversionData.sendingAmount),
        receiveAmount: parseFloat(conversionData.receiveAmount),
        todaysRate: parseFloat(conversionData.todaysRate),
        ourFee: parseFloat(config.ourFee || 0),
        specialRate: parseFloat(config.specialRate || 0),
        date: new Date(formData.date).toISOString(),
        branchName: user.branchName || '',
        branchLocation: user.branchName || '', // Using branchName as branchLocation since location not available in user
        staffName: `${user.fName || ''} ${user.lName || ''}`.trim(),
        staffEmail: user.email || ''
      };

      const data = await api.post('/api/transactions', transactionData);

      console.log('Transaction created successfully:', data);

      // Reset form
      setFormData({
        surname: '',
        fullName: '',
        mobile: '',
        address: '',
        passportNumber: '',
        email: '',
        country: '',
        date: new Date().toISOString().slice(0, 16)
      });
      setErrors({});

      // Notify parent component
      if (onTransactionCreated) {
        onTransactionCreated(data.transaction);
      }
    } catch (err) {
      console.error('Error creating transaction:', err);
      setErrors({ submit: formatErrorMessage(err) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="transaction-form-container">
      <h2 className="transaction-form-title">Record Transaction</h2>
      
      {errors.conversion && (
        <div className="transaction-error-banner">{errors.conversion}</div>
      )}

      {errors.submit && (
        <div className="transaction-error-banner">{errors.submit}</div>
      )}

      <form onSubmit={handleSubmit} className="transaction-form">
        {/* Conversion Summary - Read-only */}
        <div className="transaction-section">
          <h3 className="transaction-section-title">Conversion Details</h3>
          <div className="conversion-summary">
            <div className="conversion-row">
              <span className="conversion-label">From:</span>
              <span className="conversion-value">
                {conversionData.sendingCurrency || '---'} {conversionData.sendingAmount || '0'}
              </span>
            </div>
            <div className="conversion-row">
              <span className="conversion-label">To:</span>
              <span className="conversion-value">
                {conversionData.receiveCurrency || '---'} {conversionData.receiveAmount || '0'}
              </span>
            </div>
            <div className="conversion-row">
              <span className="conversion-label">Rate:</span>
              <span className="conversion-value">{conversionData.todaysRate || '0'}</span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="transaction-section">
          <h3 className="transaction-section-title">Customer Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="surname" className="form-label">
                Surname <span className="required">*</span>
              </label>
              <input
                type="text"
                id="surname"
                name="surname"
                className={`form-input ${errors.surname ? 'input-error' : ''}`}
                placeholder="Enter surname"
                value={formData.surname}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.surname && <span className="error-text">{errors.surname}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mobile" className="form-label">
                Mobile <span className="required">*</span>
              </label>
              <input
                type="text"
                id="mobile"
                name="mobile"
                className={`form-input ${errors.mobile ? 'input-error' : ''}`}
                placeholder="Enter mobile number"
                value={formData.mobile}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.mobile && <span className="error-text">{errors.mobile}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="passportNumber" className="form-label">
                Passport Number <span className="required">*</span>
              </label>
              <input
                type="text"
                id="passportNumber"
                name="passportNumber"
                className={`form-input ${errors.passportNumber ? 'input-error' : ''}`}
                placeholder="Enter passport number"
                value={formData.passportNumber}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.passportNumber && <span className="error-text">{errors.passportNumber}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="country" className="form-label">
                Country <span className="required">*</span>
              </label>
              <input
                type="text"
                id="country"
                name="country"
                className={`form-input ${errors.country ? 'input-error' : ''}`}
                placeholder="Enter country"
                value={formData.country}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.country && <span className="error-text">{errors.country}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Address <span className="required">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              className={`form-input ${errors.address ? 'input-error' : ''}`}
              placeholder="Enter address"
              value={formData.address}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Date & Time <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              className={`form-input ${errors.date ? 'input-error' : ''}`}
              value={formData.date}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.date && <span className="error-text">{errors.date}</span>}
          </div>
        </div>

        <button
          type="submit"
          className="transaction-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Recording...' : 'Record Transaction'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;

