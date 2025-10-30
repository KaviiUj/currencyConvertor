const express = require('express');
const User = require('../models/User');

const router = express.Router();

// POST /api/users - Create user
router.post('/', async (req, res) => {
  try {
    const requiredFields = [
      'fName', 'lName', 'mobile', 'role', 'password', 'address', 'passportNumber', 'country'
    ];

    // Ensure all required fields are present and non-empty
    const missing = requiredFields.filter(
      (field) => !(field in req.body) || req.body[field] === undefined || req.body[field] === null || String(req.body[field]).trim() === ''
    );

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'ValidationError',
        message: `Missing required field(s): ${missing.join(', ')}`
      });
    }

    const { fName, lName, mobile, role, password, address, passportNumber, country, branchName, branchCode, branchId } = req.body;

    // Validate role
    const roleNumber = Number(role);
    if (![85, 96].includes(roleNumber)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Role must be 85 (admin) or 96 (staff)'
      });
    }

    // Basic mobile normalization
    const normalizedMobile = String(mobile).trim();
    const normalizedPassport = String(passportNumber).trim().toUpperCase();

    // Check for duplicates by mobile or passportNumber
    const existing = await User.findOne({ $or: [ { mobile: normalizedMobile }, { passportNumber: normalizedPassport } ] }).lean();
    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with the same mobile or passportNumber already exists'
      });
    }

    const user = new User({
      fName: String(fName).trim(),
      lName: String(lName).trim(),
      mobile: normalizedMobile,
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

    return res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    // Handle duplicate key errors explicitly
    if (error && error.code === 11000) {
      const key = Object.keys(error.keyPattern || {})[0] || 'unique field';
      return res.status(409).json({
        error: 'Conflict',
        message: `Duplicate value for ${key}`
      });
    }

    console.error('Create user error:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'An unexpected error occurred'
    });
  }
});

module.exports = router;


