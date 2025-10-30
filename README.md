# Currency Converter - MERN Stack Application

A modern currency converter application built with the MERN stack (MongoDB, Express, React, Node.js).

## 🚀 Features

- **Login System** - Secure authentication with JWT
- **MongoDB Integration** - Robust database connection with Mongoose
- **Modern UI** - Beautiful and responsive login page
- **JWT Authentication** - Secure token-based authentication

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd currencyConvertor
```

2. Install backend dependencies:
```bash
npm run install-server
```

3. Install frontend dependencies:
```bash
npm run install-client
```

Or install all at once:
```bash
npm run install-all
```

4. Configure environment variables:
Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
DB_NAME=currencyConvertor
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

## 🎯 Usage

### Development Mode (Runs both server and client)

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

### Run Separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## 📁 Project Structure

```
currencyConvertor/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── Login/     # Login page component
│   │   ├── App.js
│   │   └── index.js
│   └── public/
├── server/                 # Express backend
│   ├── config/
│   │   └── database.js    # MongoDB connection
│   ├── middleware/
│   │   └── auth.js        # JWT authentication middleware
│   ├── models/
│   │   └── User.js        # User model
│   ├── utils/
│   │   └── jwt.js         # JWT utilities
│   └── index.js           # Express server
├── package.json
├── .env                   # Environment variables
└── README.md
```

## 🗄️ Database Configuration

- **Database Name**: `currencyConvertor`
- **MongoDB Atlas**: Configured with the provided connection string
- **Models**: User model with authentication fields

## 🔐 Authentication

- JWT-based authentication
- Password hashing with bcryptjs
- Token generation and verification utilities included
- Authentication middleware ready for use

## 🎨 Frontend

The frontend includes a beautiful, modern login page with:
- Form validation
- Error handling
- Responsive design
- Smooth animations
- Gradient background

## 📝 API Routes

Currently no API routes are implemented. The backend is set up with:
- Health check endpoint: `GET /api/health`
- Database connection ready
- Authentication utilities ready

## 🔧 Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React
- CSS3 with animations
- Modern UI/UX design

## 📜 License

ISC

## 👨‍💻 Author

Created with ❤️ using MERN Stack

