const express = require('express');
const User = require('../models/User');
const logger = require('../utils/logger');

const router = express.Router();

// POST /api/users - Create user
router.post('/', async (req, res) => {
  try {
    logger.info('Creating new user', { body: req.body });
    
    const requiredFields = [
      'fName', 'lName', 'mobile', 'email', 'role', 'password', 'address', 'passportNumber', 'country'
    ];

    // Ensure all required fields are present and non-empty
    const missing = requiredFields.filter(
      (field) => !(field in req.body) || req.body[field] === undefined || req.body[field] === null || String(req.body[field]).trim() === ''
    );

    if (missing.length > 0) {
      logger.validation('Missing required fields', { missing });
      return res.status(400).json({
        error: 'ValidationError',
        message: `Missing required field(s): ${missing.join(', ')}`
      });
    }

    const { fName, lName, mobile, email, role, password, address, passportNumber, country, branchName, branchCode, branchId } = req.body;

    // Validate role
    const roleNumber = Number(role);
    if (![85, 96].includes(roleNumber)) {
      logger.validation('Invalid role', { role: roleNumber });
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Role must be 85 (admin) or 96 (staff)'
      });
    }

    // Basic mobile normalization
    const normalizedMobile = String(mobile).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPassport = String(passportNumber).trim().toUpperCase();

    // Check for duplicates by mobile, email, or passportNumber
    logger.debug('Checking for duplicate user', { mobile: normalizedMobile, email: normalizedEmail, passportNumber: normalizedPassport });
    const existing = await User.findOne({ $or: [ { mobile: normalizedMobile }, { email: normalizedEmail }, { passportNumber: normalizedPassport } ] }).lean();
    if (existing) {
      logger.warn('Duplicate user found', { mobile: normalizedMobile, email: normalizedEmail, passportNumber: normalizedPassport });
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with the same mobile, email, or passportNumber already exists'
      });
    }

    logger.db('INSERT', 'users', { 
      fName, 
      lName, 
      mobile: normalizedMobile,
      email: normalizedEmail, 
      role: roleNumber,
      passportNumber: normalizedPassport,
      country,
      hasBranchInfo: !!(branchName || branchCode || branchId)
    });

    const user = new User({
      fName: String(fName).trim(),
      lName: String(lName).trim(),
      mobile: normalizedMobile,
      email: normalizedEmail,
      role: roleNumber,
      password: String(password),
      address: String(address).trim(),
      passportNumber: normalizedPassport,
      country: String(country).trim(),
      ...(branchName && { branchName: String(branchName).trim() }),
      ...(branchCode && { branchCode: String(branchCode).trim() }),
      ...(branchId && { branchId: String(branchId).trim() })
    });

    await user.save();

    logger.success('User created successfully', { userId: user.userId, mobile: user.mobile, email: user.email, role: user.role });

    return res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    // Handle duplicate key errors explicitly
    if (error && error.code === 11000) {
      const key = Object.keys(error.keyPattern || {})[0] || 'unique field';
      logger.error('Database duplicate key error', { 
        code: error.code, 
        keyPattern: error.keyPattern,
        keyValue: error.keyValue 
      });
      return res.status(409).json({
        error: 'Conflict',
        message: `Duplicate value for ${key}`
      });
    }

    logger.error('Create user error', { 
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

module.exports = router;


