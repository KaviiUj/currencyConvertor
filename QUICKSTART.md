# Quick Start Guide

## How to Run the Project

### Step 1: Install Dependencies (Only First Time)

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

Or install both at once:
```bash
npm run install-all
```

### Step 2: Make Sure .env File Exists

The `.env` file with your MongoDB connection and JWT secret is already created in the root directory.

### Step 3: Run the Development Servers

Run both backend and frontend together with one command:

```bash
npm run dev
```

This will start:
- **Backend Server** on `http://localhost:5001` (Note: Changed from 5000 due to macOS AirPlay)
- **Frontend React App** on `http://localhost:3000`

### Step 4: Open Your Browser

Navigate to: `http://localhost:3000`

You should see the login page!

---

## Alternative: Run Servers Separately

### Backend Only
```bash
npm run server
```

### Frontend Only
```bash
npm run client
```

---

## Verify Everything is Working

### Check Backend
Open your browser and visit: `http://localhost:5001/api/health`

You should see:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "..."
}
```

### Check Frontend
Open your browser and visit: `http://localhost:3000`

You should see the login page with:
- Email input field
- Password input field
- Sign In button

---

## Troubleshooting

### Port Already in Use
If you get "port already in use" error:

1. **Kill the process using the port:**
   ```bash
   # For port 5001 (backend)
   lsof -ti:5001 | xargs kill -9
   
   # For port 3000 (frontend)
   lsof -ti:3000 | xargs kill -9
   ```

2. **Or change the port in .env file:**
   ```
   PORT=5002
   ```

### MongoDB Connection Error
- Check your internet connection
- Verify the MongoDB connection string in `.env` file
- Check if the MongoDB cluster is running

### Dependencies Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules client/node_modules
npm run install-all
```

---

## What's Included

✅ **Backend:**
- Express.js server
- MongoDB connection
- JWT authentication utilities
- User model with password hashing
- Authentication middleware

✅ **Frontend:**
- Beautiful login page
- Form validation
- Responsive design
- Modern UI with gradients

---

## Next Steps

- Login page is ready for UI testing
- Backend is ready to add API endpoints
- User model is ready for database operations
- JWT utilities are ready for authentication

Happy coding! 🚀

