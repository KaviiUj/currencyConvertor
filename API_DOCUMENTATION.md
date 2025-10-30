# API Documentation

## Create User API

### Endpoint
```
POST /api/users
```

### URL
```
http://localhost:5001/api/users
```

**Note:** Changed from port 5000 to 5001 because port 5000 is used by macOS AirPlay Receiver.

### Request Headers
```
Content-Type: application/json
```

### Request Body
**Note:** Some fields are mandatory, some are optional.

**Mandatory Fields:**
```json
{
  "fName": "John",
  "lName": "Doe",
  "mobile": "+11234567890",
  "role": 85,
  "password": "Secret123",
  "address": "123 Main Street, City",
  "passportNumber": "P1234567",
  "country": "USA"
}
```

**With Optional Branch Fields:**
```json
{
  "fName": "John",
  "lName": "Doe",
  "mobile": "+11234567890",
  "role": 85,
  "password": "Secret123",
  "address": "123 Main Street, City",
  "passportNumber": "P1234567",
  "country": "USA",
  "branchName": "Downtown Branch",
  "branchCode": "DT001",
  "branchId": "BR123456"
}
```

#### Field Details:
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `fName` | String | First name | **Required**, 2-50 characters |
| `lName` | String | Last name | **Required**, 2-50 characters |
| `mobile` | String | Mobile number | **Required**, unique |
| `role` | Number | User role | **Required**, must be 85 (admin) or 96 (staff) |
| `password` | String | Password | **Required**, minimum 6 characters |
| `address` | String | Address | **Required** |
| `passportNumber` | String | Passport number | **Required**, unique |
| `country` | String | Country | **Required** |
| `branchName` | String | Branch name | Optional |
| `branchCode` | String | Branch code | Optional |
| `branchId` | String | Branch ID | Optional |

### Role Values:
- **85** = Admin
- **96** = Staff

---

## Success Response (201 Created)

```json
{
  "message": "User created successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fName": "John",
    "lName": "Doe",
    "mobile": "+11234567890",
    "role": 85,
    "address": "123 Main Street, City",
    "passportNumber": "P1234567",
    "country": "USA",
    "branchName": "Downtown Branch",
    "branchCode": "DT001",
    "branchId": "BR123456",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Error Responses

### 400 Bad Request - Missing Fields
```json
{
  "error": "ValidationError",
  "message": "Missing required field(s): fName, role"
}
```

### 400 Bad Request - Invalid Role
```json
{
  "error": "ValidationError",
  "message": "Role must be 85 (admin) or 96 (staff)"
}
```

### 409 Conflict - Duplicate User
```json
{
  "error": "Conflict",
  "message": "User with the same mobile or passportNumber already exists"
}
```

### 500 Server Error
```json
{
  "error": "ServerError",
  "message": "An unexpected error occurred"
}
```

---

## Example cURL Commands

### Create Admin User
```bash
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "fName": "John",
    "lName": "Doe",
    "mobile": "+11234567890",
    "role": 85,
    "password": "Secret123",
    "address": "123 Main Street, City",
    "passportNumber": "P1234567",
    "country": "USA"
  }'
```

### Create Staff User
```bash
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "fName": "Jane",
    "lName": "Smith",
    "mobile": "+11234567891",
    "role": 96,
    "password": "Secure456",
    "address": "456 Oak Avenue, Town",
    "passportNumber": "P7654321",
    "country": "Canada"
  }'
```

### Create User with Branch Fields
```bash
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "fName": "John",
    "lName": "Doe",
    "mobile": "+11234567892",
    "role": 85,
    "password": "Secret123",
    "address": "123 Main Street, City",
    "passportNumber": "P1234568",
    "country": "USA",
    "branchName": "Downtown Branch",
    "branchCode": "DT001",
    "branchId": "BR123456"
  }'
```

---

## Example JavaScript (Fetch API)

```javascript
const createUser = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fName: 'John',
        lName: 'Doe',
        mobile: '+11234567890',
        role: 85,
        password: 'Secret123',
        address: '123 Main Street, City',
        passportNumber: 'P1234567',
        country: 'USA'
      })
    });

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Example Postman Collection

### Postman Settings:
- **Method**: POST
- **URL**: `http://localhost:5001/api/users`
- **Headers**: 
  - Key: `Content-Type`
  - Value: `application/json`
- **Body**: Raw JSON (as shown in Request Body above)

---

## Health Check (Test Server)

```
GET http://localhost:5001/api/health
```

Response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Notes

- Password is automatically hashed using bcrypt
- Password is never returned in responses
- Mobile and PassportNumber must be unique
- Role field is strictly validated (only 85 or 96)
- All string fields are trimmed
- PassportNumber is automatically converted to uppercase
- Timestamps (createdAt, updatedAt) are automatically added

