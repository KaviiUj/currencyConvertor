import React, { useState, useEffect } from 'react';
import Toast from '../../components/Toast/Toast';
import { api, formatErrorMessage } from '../../utils/apiHandler';
import './Settings.css';

const Settings = () => {
  const [formData, setFormData] = useState({
    specialRate: '',
    ourFee: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    try {
      const configStr = localStorage.getItem('config');
      if (configStr) {
        const config = JSON.parse(configStr);
        setFormData({
          specialRate: config.specialRate !== null && config.specialRate !== undefined ? config.specialRate.toString() : '0',
          ourFee: config.ourFee !== null && config.ourFee !== undefined ? config.ourFee.toString() : '0'
        });
      }
    } catch (err) {
      console.error('Error loading config:', err);
      setFormData({
        specialRate: '0',
        ourFee: '0'
      });
    }
  };

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

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // If field is empty, set it to 0
    if (value === '' || value === null || value === undefined) {
      setFormData(prev => ({
        ...prev,
        [name]: '0'
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Special Rate validation
    if (formData.specialRate === '' || formData.specialRate === null || formData.specialRate === undefined) {
      newErrors.specialRate = 'Special rate is required (use 0 if not applicable)';
    } else if (isNaN(formData.specialRate)) {
      newErrors.specialRate = 'Special rate must be a valid number';
    } else if (parseFloat(formData.specialRate) < 0) {
      newErrors.specialRate = 'Special rate cannot be negative';
    }

    // Our Fee validation
    if (formData.ourFee === '' || formData.ourFee === null || formData.ourFee === undefined) {
      newErrors.ourFee = 'Our fee is required (use 0 if not applicable)';
    } else if (isNaN(formData.ourFee)) {
      newErrors.ourFee = 'Our fee must be a valid number';
    } else if (parseFloat(formData.ourFee) < 0) {
      newErrors.ourFee = 'Our fee cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateSettings = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const requestData = {
        specialRate: parseFloat(formData.specialRate),
        ourFee: parseFloat(formData.ourFee)
      };

      const data = await api.post('/api/config/update', requestData);

      console.log('Config updated successfully:', data);

      // Update localStorage with new config
      if (data.config) {
        localStorage.setItem('config', JSON.stringify(data.config));
      }

      // Show success toast
      setToastMessage('Settings updated successfully');
      setShowToast(true);

      // Reload config from localStorage
      loadConfig();
    } catch (err) {
      console.error('Error updating config:', err);
      setToastMessage(formatErrorMessage(err));
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-content">
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <button 
            className="update-settings-btn" 
            onClick={handleUpdateSettings}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Settings'}
          </button>
        </div>

        <div className="settings-form">
          <div className="settings-section">
            <h2 className="settings-section-title">Configuration</h2>
            
            <div className="settings-field">
              <label htmlFor="specialRate" className="settings-label">
                Special Rate <span className="required">*</span>
              </label>
              <input
                type="number"
                id="specialRate"
                name="specialRate"
                className={`settings-input ${errors.specialRate ? 'input-error' : ''}`}
                placeholder="0"
                value={formData.specialRate}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                step="0.01"
                min="0"
              />
              {errors.specialRate && (
                <span className="settings-error-text">{errors.specialRate}</span>
              )}
              <p className="settings-field-description">
                Set a special exchange rate (0 means no special rate applied)
              </p>
            </div>

            <div className="settings-field">
              <label htmlFor="ourFee" className="settings-label">
                Our Fee (%) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="ourFee"
                name="ourFee"
                className={`settings-input ${errors.ourFee ? 'input-error' : ''}`}
                placeholder="0"
                value={formData.ourFee}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                step="0.01"
                min="0"
              />
              {errors.ourFee && (
                <span className="settings-error-text">{errors.ourFee}</span>
              )}
              <p className="settings-field-description">
                Set the fee percentage applied to transactions
              </p>
            </div>
          </div>
        </div>

        <Toast
          message={toastMessage}
          show={showToast}
          onClose={() => setShowToast(false)}
        />
      </div>
    </div>
  );
};

export default Settings;

