const express = require('express');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

const router = express.Router();

// POST /api/transactions - Create transaction (Authenticated users)
router.post('/', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({
        error: 'AuthenticationError',
        message: 'Authentication required'
      });
    }

    logger.info('Creating transaction', { body: req.body, userId: req.user.userId, role: req.user.role });
    
    const requiredFields = [
      'surname', 'fullName', 'mobile', 'address', 'passportNumber', 'email', 
      'country', 'sendingCurrency', 'receiveCurrency', 'sendingAmount', 
      'receiveAmount', 'todaysRate', 'ourFee', 'specialRate', 'date', 
      'branchName', 'branchLocation', 'staffName', 'staffEmail'
    ];

    // Ensure all required fields are present and non-empty
    const missing = requiredFields.filter(
      (field) => {
        const value = req.body[field];
        // For numbers, check if they're undefined or null
        if (field === 'sendingAmount' || field === 'receiveAmount' || field === 'todaysRate' || field === 'ourFee' || field === 'specialRate') {
          return value === undefined || value === null;
        }
        // For strings and date, check if empty
        return !value || String(value).trim() === '';
      }
    );

    if (missing.length > 0) {
      logger.validation('Missing required fields', { missing });
      return res.status(400).json({
        error: 'ValidationError',
        message: `Missing required field(s): ${missing.join(', ')}`
      });
    }

    const {
      surname, fullName, mobile, address, passportNumber, email,
      country, sendingCurrency, receiveCurrency, sendingAmount,
      receiveAmount, todaysRate, ourFee, specialRate, date,
      branchName, branchLocation, staffName, staffEmail
    } = req.body;

    // Validate numeric fields
    const numericFields = {
      sendingAmount: Number(sendingAmount),
      receiveAmount: Number(receiveAmount),
      todaysRate: Number(todaysRate),
      ourFee: Number(ourFee),
      specialRate: Number(specialRate)
    };

    for (const [field, value] of Object.entries(numericFields)) {
      if (isNaN(value)) {
        logger.validation(`Invalid ${field} format`, { [field]: req.body[field] });
        return res.status(400).json({
          error: 'ValidationError',
          message: `${field} must be a valid number`
        });
      }
    }

    // Validate date
    const transactionDate = new Date(date);
    if (isNaN(transactionDate.getTime())) {
      logger.validation('Invalid date format', { date });
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Date must be a valid date'
      });
    }

    // Create transaction
    const transaction = new Transaction({
      surname: String(surname).trim(),
      fullName: String(fullName).trim(),
      mobile: String(mobile).trim(),
      address: String(address).trim(),
      passportNumber: String(passportNumber).trim().toUpperCase(),
      email: String(email).trim().toLowerCase(),
      country: String(country).trim(),
      sendingCurrency: String(sendingCurrency).trim(),
      receiveCurrency: String(receiveCurrency).trim(),
      sendingAmount: numericFields.sendingAmount,
      receiveAmount: numericFields.receiveAmount,
      todaysRate: numericFields.todaysRate,
      ourFee: numericFields.ourFee,
      specialRate: numericFields.specialRate,
      date: transactionDate,
      branchName: String(branchName).trim(),
      branchLocation: String(branchLocation).trim(),
      staffName: String(staffName).trim(),
      staffEmail: String(staffEmail).trim().toLowerCase()
    });

    await transaction.save();

    logger.success('Transaction created successfully', { 
      transactionId: transaction.transactionId, 
      passportNumber: transaction.passportNumber 
    });

    return res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });

  } catch (error) {
    logger.error('Create transaction error', { 
      message: error.message, 
      stack: error.stack,
      body: req.body 
    });
    return res.status(500).json({
      error: 'ServerError',
      message: 'An unexpected error occurred'
    });
  }
});

// GET /api/transactions/history - Get transaction history (Admin gets all, Staff gets only their branch)
router.get('/history', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({
        error: 'AuthenticationError',
        message: 'Authentication required'
      });
    }

    logger.info('Fetching transaction history', { 
      userId: req.user.userId, 
      role: req.user.role,
      branchName: req.user.branchName 
    });

    let query = {};

    // If staff (role 96), filter by their branch
    if (req.user.role === 96) {
      if (!req.user.branchName) {
        logger.warn('Staff user has no branch assigned', { userId: req.user.userId });
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Staff member has no branch assigned'
        });
      }
      query.branchName = req.user.branchName;
    }
    // If admin (role 85), no filter - get all transactions

    const transactions = await Transaction.find(query).sort({ createdAt: -1 });

    logger.success(`Retrieved ${transactions.length} transaction(s)`, { 
      role: req.user.role,
      branchName: req.user.branchName || 'all'
    });

    return res.status(200).json({
      message: 'Transaction history retrieved successfully',
      count: transactions.length,
      transactions
    });

  } catch (error) {
    logger.error('Get transaction history error', { 
      message: error.message, 
      stack: error.stack 
    });
    return res.status(500).json({
      error: 'ServerError',
      message: 'An unexpected error occurred'
    });
  }
});

module.exports = router;

