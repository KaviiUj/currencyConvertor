# API Handler Utility

Global API error handler for consistent error handling across the application.

## Features

- Centralized error handling
- Automatic error message extraction from API responses
- Support for various error formats
- Built-in authentication token management
- Network error handling
- Custom error types

## Usage

### Basic GET Request

```javascript
import { api, formatErrorMessage } from '../utils/apiHandler';

const fetchData = async () => {
  try {
    const data = await api.get('/api/endpoint');
    console.log(data);
  } catch (error) {
    const errorMessage = formatErrorMessage(error);
    console.error(errorMessage);
  }
};
```

### POST Request

```javascript
import { api, formatErrorMessage } from '../utils/apiHandler';

const createItem = async (itemData) => {
  try {
    const response = await api.post('/api/items', itemData);
    return response;
  } catch (error) {
    throw new Error(formatErrorMessage(error));
  }
};
```

### PUT/PATCH Request

```javascript
import { api } from '../utils/apiHandler';

const updateItem = async (id, updates) => {
  const data = await api.put(`/api/items/${id}`, updates);
  // or
  const data = await api.patch(`/api/items/${id}`, updates);
  return data;
};
```

### DELETE Request

```javascript
import { api } from '../utils/apiHandler';

const deleteItem = async (id) => {
  await api.delete(`/api/items/${id}`);
};
```

### Disable Authentication

```javascript
// Third parameter controls authentication (default: true)
const data = await api.get('/api/public-endpoint', false);
```

### React Component Example

```javascript
import React, { useState, useEffect } from 'react';
import { api, formatErrorMessage } from '../utils/apiHandler';

const MyComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/data');
      setData(response.items || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
```

## Error Handling

The API handler automatically extracts error messages from various response formats:

- `{ message: "Error message" }`
- `{ error: "Error message" }`
- `{ error: { message: "Error message" } }`
- `{ errors: [{ message: "Error 1" }, { message: "Error 2" }] }`

## API Methods

- `api.get(endpoint, includeAuth)` - GET request
- `api.post(endpoint, data, includeAuth)` - POST request
- `api.put(endpoint, data, includeAuth)` - PUT request
- `api.patch(endpoint, data, includeAuth)` - PATCH request
- `api.delete(endpoint, includeAuth)` - DELETE request

## Error Types

### APIError

Custom error class with:
- `message` - Error message
- `statusCode` - HTTP status code
- `details` - Additional error details

### Common Status Codes

- `0` - Network error / Connection failed
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

