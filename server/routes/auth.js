const express = require('express');
const User = require('../models/User');
const Staff = require('../models/Staff');
const TokenBlacklist = require('../models/TokenBlacklist');
const logger = require('../utils/logger');
const { generateToken, verifyToken, decodeToken } = require('../utils/jwt');

const router = express.Router();

// POST /api/auth/login - User/Staff login
router.post('/login', async (req, res) => {
  try {
    logger.info('Login attempt', { email: req.body.email });
    
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      logger.validation('Missing email or password', { email: !!email, password: !!password });
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Email and password are required'
      });
    }

    // Normalize email
    const normalizedEmail = String(email).trim().toLowerCase();

    // Try to find user in User collection first, then Staff collection
    let user = await User.findOne({ email: normalizedEmail }).select('+password');
    let userType = 'User';
    
    if (!user) {
      user = await Staff.findOne({ email: normalizedEmail }).select('+password');
      userType = 'Staff';
    }
    
    if (!user) {
      logger.warn('Login failed - user/staff not found', { email: normalizedEmail });
      return res.status(401).json({
        error: 'AuthenticationError',
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn('Login failed - user inactive', { email: normalizedEmail });
      return res.status(403).json({
        error: 'AuthenticationError',
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      logger.warn('Login failed - invalid password', { email: normalizedEmail });
      return res.status(401).json({
        error: 'AuthenticationError',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token with user data
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fName: user.fName,
      lName: user.lName
    };

    // Add branch info to token if available
    if (user.branchName) {
      tokenPayload.branchName = user.branchName;
      tokenPayload.branchId = user.branchId;
    }

    const accessToken = generateToken(tokenPayload, '9h');

    logger.success('Login successful', { 
      userId: user._id.toString(), 
      email: user.email, 
      role: user.role,
      userType
    });

    // Build user response
    const userResponse = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fName: user.fName,
      lName: user.lName,
      isActive: user.isActive,
      lastLogin: user.lastLogin
    };

    // Add branch info to response if available
    if (user.branchName || user.branchId) {
      userResponse.branchName = user.branchName || null;
      userResponse.branchId = user.branchId || null;
    }

    // Return response
    return res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: userResponse
    });

  } catch (error) {
    logger.error('Login error', { 
      message: error.message, 
      stack: error.stack 
    });
    return res.status(500).json({
      error: 'ServerError',
      message: 'An unexpected error occurred'
    });
  }
});

// GET /api/auth/logout - User logout
router.get('/logout', async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.validation('Missing or invalid authorization header');
      return res.status(401).json({ 
        error: 'AuthenticationError',
        message: 'Authentication required. No token provided.' 
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Decode token to get expiration and user info
    const decoded = decodeToken(token);
    
    if (!decoded || !decoded.exp) {
      logger.warn('Invalid token - unable to decode', { token: token.substring(0, 20) });
      return res.status(401).json({
        error: 'AuthenticationError',
        message: 'Invalid token'
      });
    }

    // Check if token is already blacklisted
    const existingBlacklist = await TokenBlacklist.findOne({ token });
    
    if (existingBlacklist) {
      logger.warn('Token already blacklisted', { userId: decoded.userId });
      return res.status(200).json({
        message: 'Already logged out'
      });
    }

    // Add token to blacklist
    const expiresAt = new Date(decoded.exp * 1000); // Convert Unix timestamp to Date
    
    const blacklistEntry = new TokenBlacklist({
      token,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      expiresAt
    });

    await blacklistEntry.save();

    logger.success('Logout successful', { 
      userId: decoded.userId, 
      email: decoded.email 
    });

    return res.status(200).json({
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error', { 
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

