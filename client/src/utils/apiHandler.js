import { API_CONFIG } from '../config/api';

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Extract error message from API response
 * @param {Response} response - Fetch response object
 * @returns {Promise<string>} Error message
 */
const extractErrorMessage = async (response) => {
  try {
    const data = await response.json();
    
    // Check for various error message formats
    if (data.message) {
      return data.message;
    }
    if (data.error) {
      return typeof data.error === 'string' ? data.error : data.error.message || 'An error occurred';
    }
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map(err => err.message || err).join(', ');
    }
    
    return `Request failed with status ${response.status}`;
  } catch (error) {
    // If response is not JSON or parsing fails
    return `Request failed with status ${response.status}: ${response.statusText}`;
  }
};

/**
 * Generic API request handler with error handling
 * @param {string} endpoint - API endpoint (e.g., '/api/branches')
 * @param {object} options - Fetch options
 * @param {boolean} includeAuth - Whether to include authentication token
 * @returns {Promise<any>} Response data
 */
export const apiRequest = async (endpoint, options = {}, includeAuth = true) => {
  try {
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_CONFIG.BASE_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authentication token if required
    if (includeAuth) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle successful responses
    if (response.ok) {
      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return null;
    }

    // Handle error responses
    const errorMessage = await extractErrorMessage(response);
    throw new APIError(errorMessage, response.status);

  } catch (error) {
    // Handle network errors or other fetch errors
    if (error instanceof APIError) {
      throw error;
    }
    
    // Network error or other issue
    if (error.message === 'Failed to fetch') {
      throw new APIError('Network error. Please check your connection.', 0);
    }
    
    throw new APIError(error.message || 'An unexpected error occurred', 0);
  }
};

/**
 * API helper methods
 */
export const api = {
  /**
   * GET request
   */
  get: (endpoint, includeAuth = true) => {
    return apiRequest(endpoint, { method: 'GET' }, includeAuth);
  },

  /**
   * POST request
   */
  post: (endpoint, data, includeAuth = true) => {
    return apiRequest(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      includeAuth
    );
  },

  /**
   * PUT request
   */
  put: (endpoint, data, includeAuth = true) => {
    return apiRequest(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      includeAuth
    );
  },

  /**
   * PATCH request
   */
  patch: (endpoint, data, includeAuth = true) => {
    return apiRequest(
      endpoint,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      includeAuth
    );
  },

  /**
   * DELETE request
   */
  delete: (endpoint, includeAuth = true) => {
    return apiRequest(endpoint, { method: 'DELETE' }, includeAuth);
  },
};

/**
 * Format error message for display
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (error instanceof APIError) {
    return error.message;
  }
  
  if (error.response) {
    return error.response.data?.message || 'An error occurred with the server';
  }
  
  return error.message || 'An unexpected error occurred';
};

