# API Testing Guide

## Quick Test Commands

### Test the API with your exact request:

```bash
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "fName": "Kavindu",
    "lName": "Jay",
    "mobile": "+11234567890",
    "role": 85,
    "password": "Secret123",
    "address": "123 Main Street, City",
    "passportNumber": "P1234567",
    "country": "Sri Lanka"
  }'
```

### Expected Response (201 Created):
```json
{
  "message": "User created successfully",
  "user": {
    "fName": "Kavindu",
    "lName": "Jay",
    "mobile": "+11234567890",
    "role": 85,
    "address": "123 Main Street, City",
    "passportNumber": "P1234567",
    "country": "Sri Lanka",
    "isActive": true,
    "_id": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## Important Notes

### ✅ Port Changed to 5001
The API is now running on **port 5001** instead of 5000 because:
- Port 5000 is used by macOS AirPlay Receiver
- You were getting 403 errors because AirPlay was intercepting the requests

### ✅ Update Your .env File
The `.env` file has been updated to use port 5001:
```env
PORT=5001
```

### ✅ To Start the Server
```bash
npm run dev
```
Or just the backend:
```bash
npm run server
```

---

## Using Different Tools

### Postman
1. **Method**: POST
2. **URL**: `http://localhost:5001/api/users`
3. **Headers**: `Content-Type: application/json`
4. **Body**: Raw JSON (paste your request body)

### Browser Console (JavaScript)
```javascript
fetch('http://localhost:5001/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fName: "Kavindu",
    lName: "Jay",
    mobile: "+11234567890",
    role: 85,
    password: "Secret123",
    address: "123 Main Street, City",
    passportNumber: "P1234567",
    country: "Sri Lanka"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

### Thunder Client / REST Client
```http
POST http://localhost:5001/api/users
Content-Type: application/json

{
  "fName": "Kavindu",
  "lName": "Jay",
  "mobile": "+11234567890",
  "role": 85,
  "password": "Secret123",
  "address": "123 Main Street, City",
  "passportNumber": "P1234567",
  "country": "Sri Lanka"
}
```

---

## Test Different Scenarios

### Test Staff User (Role 96)
```bash
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "fName": "Jane",
    "lName": "Smith",
    "mobile": "+11234567891",
    "role": 96,
    "password": "Secure456",
    "address": "456 Oak Avenue",
    "passportNumber": "P7654321",
    "country": "Canada"
  }'
```

### Test Duplicate User (Should Fail with 409)
```bash
# Run the same request twice with same mobile/passportNumber
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "fName": "John",
    "lName": "Doe",
    "mobile": "+11234567890",
    "role": 85,
    "password": "Secret123",
    "address": "123 Main Street",
    "passportNumber": "P1234567",
    "country": "USA"
  }'
```

### Test Missing Fields (Should Fail with 400)
```bash
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "fName": "John",
    "lName": "Doe"
  }'
```

### Test Invalid Role (Should Fail with 400)
```bash
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "fName": "John",
    "lName": "Doe",
    "mobile": "+11234567893",
    "role": 99,
    "password": "Secret123",
    "address": "123 Main Street",
    "passportNumber": "P1234569",
    "country": "USA"
  }'
```

---

## Check Health Endpoint
```bash
curl http://localhost:5001/api/health
```

Expected:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "..."
}
```

---

## Summary

✅ **API URL**: `http://localhost:5001/api/users`  
✅ **Method**: POST  
✅ **Content-Type**: application/json  
✅ **Your request works perfectly!**  

The user was successfully created in MongoDB!

