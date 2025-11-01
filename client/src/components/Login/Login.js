import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import Toast from '../Toast/Toast';
import Alert from '../Alert/Alert';
import { api, formatErrorMessage } from '../../utils/apiHandler';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/home');
    }
  }, [navigate]);

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

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
    setErrors({});

    try {
      // Login request - no auth needed for login
      const data = await api.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      }, false);

      // Store token and role in localStorage
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }

      if (data.user && data.user.role !== undefined) {
        localStorage.setItem('role', data.user.role.toString());
      }

      // Store user info if needed
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      console.log('Login successful:', data);
      
      // Fetch config after successful login
      try {
        const configData = await api.get('/api/config');
        
        if (configData.config) {
          // Store config in localStorage
          localStorage.setItem('config', JSON.stringify(configData.config));
          console.log('Config fetched and stored:', configData.config);
        }
      } catch (configError) {
        console.error('Error fetching config:', configError);
        // Store default config on error
        localStorage.setItem('config', JSON.stringify({ ourFee: 0, specialRate: null }));
      }
      
      // Clear the form and show success toast
      setFormData({
        email: '',
        password: ''
      });

      setShowToast(true);
      
      // Redirect to home after a short delay to show the toast
      setTimeout(() => {
        navigate('/home');
      }, 1500);
      
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = formatErrorMessage(error);
      setAlertMessage(errorMsg);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue to Currency Converter</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <Alert
            message={alertMessage}
            show={showAlert}
            onClose={() => setShowAlert(false)}
          />

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
              placeholder="Enter your password"
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
      
      <Toast
        message="Login success"
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default Login;

