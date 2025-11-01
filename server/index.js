const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./utils/logger');
const { requestLogger, errorLogger } = require('./middleware/logger');
const { authenticate } = require('./middleware/auth');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (must be before routes)
app.use(requestLogger);

// MongoDB Connection
const connectDB = require('./config/database');

// Import connection function
const initializeDB = async () => {
  try {
    await connectDB();
    logger.success('MongoDB Connected Successfully');
  } catch (error) {
    logger.error('Database initialization failed', { message: error.message, stack: error.stack });
    process.exit(1);
  }
};

// Routes
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const branchesRouter = require('./routes/branches');
const staffRouter = require('./routes/staff');
const configRouter = require('./routes/config');
const transactionsRouter = require('./routes/transactions');

app.use('/api/create-user', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/branches', authenticate, branchesRouter);
app.use('/api/staff', authenticate, staffRouter);
app.use('/api/config', authenticate, configRouter);
app.use('/api/transactions', authenticate, transactionsRouter);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error logging middleware (must be before other error handlers)
app.use(errorLogger);

// 404 handler for undefined routes
app.use((req, res) => {
  logger.warn('Route not found', { method: req.method, path: req.path, url: req.originalUrl });
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
const PORT = process.env.PORT || 5000;

initializeDB().then(() => {
  app.listen(PORT, () => {
    logger.success(`Server running on port ${PORT}`);
  });
});

module.exports = app;

