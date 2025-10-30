const express = require('express');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const logger = require('../utils/logger');
const { generateToken, verifyToken, decodeToken } = require('../utils/jwt');

const router = express.Router();

// POST /api/auth/login - User login
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

    // Find user by email and include password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    
    if (!user) {
      logger.warn('Login failed - user not found', { email: normalizedEmail });
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

    const accessToken = generateToken(tokenPayload, '9h');

    logger.success('Login successful', { 
      userId: user._id.toString(), 
      email: user.email, 
      role: user.role 
    });

    // Return response
    return res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        fName: user.fName,
        lName: user.lName,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      }
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

