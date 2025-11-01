const express = require('express');
const Config = require('../models/Config');
const logger = require('../utils/logger');

const router = express.Router();

// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'AuthenticationError',
      message: 'Authentication required'
    });
  }
  
  if (req.user.role !== 85) {
    logger.warn('Unauthorized access attempt', { userId: req.user.userId, role: req.user.role });
    return res.status(403).json({
      error: 'AuthorizationError',
      message: 'Only admin users can perform this action'
    });
  }
  
  next();
};

// POST /api/config - Create config (Admin only)
router.post('/', adminOnly, async (req, res) => {
  try {
    logger.info('Creating config', { body: req.body, adminId: req.user.userId });
    
    const { specialRate, ourFee } = req.body;

    // Validate required fields
    if (specialRate === undefined || ourFee === undefined) {
      logger.validation('Missing required config fields', { specialRate: specialRate !== undefined, ourFee: ourFee !== undefined });
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Special rate and our fee are required'
      });
    }

    // Validate that values are numbers
    const numSpecialRate = Number(specialRate);
    const numOurFee = Number(ourFee);

    if (isNaN(numSpecialRate) || isNaN(numOurFee)) {
      logger.validation('Invalid number format', { specialRate, ourFee });
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Special rate and our fee must be valid numbers'
      });
    }

    // Check if config already exists (only allow one config)
    const existingConfig = await Config.findOne({});
    
    if (existingConfig) {
      logger.warn('Config already exists');
      return res.status(409).json({
        error: 'Conflict',
        message: 'Configuration already exists. Use update endpoint to modify it.'
      });
    }

    // Create config
    const config = new Config({
      specialRate: numSpecialRate,
      ourFee: numOurFee
    });

    await config.save();

    logger.success('Config created successfully', { configId: config.configId });

    return res.status(201).json({
      message: 'Config created successfully',
      config
    });

  } catch (error) {
    logger.error('Create config error', { 
      message: error.message, 
      stack: error.stack 
    });
    return res.status(500).json({
      error: 'ServerError',
      message: 'An unexpected error occurred'
    });
  }
});

// GET /api/config - Get all config (Admin and Staff)
router.get('/', async (req, res) => {
  try {
    // Allow both admin and staff to access
    if (!req.user) {
      return res.status(401).json({
        error: 'AuthenticationError',
        message: 'Authentication required'
      });
    }

    logger.info('Fetching config', { userId: req.user.userId, role: req.user.role });

    const config = await Config.find({});

    logger.success(`Retrieved ${config.length} config(s)`);

    return res.status(200).json({
      message: 'Config retrieved successfully',
      count: config.length,
      config: config.length > 0 ? config[0] : null
    });

  } catch (error) {
    logger.error('Get config error', { 
      message: error.message, 
      stack: error.stack 
    });
    return res.status(500).json({
      error: 'ServerError',
      message: 'An unexpected error occurred'
    });
  }
});

// POST /api/config/update - Update config (Admin only)
router.post('/update', adminOnly, async (req, res) => {
  try {
    logger.info('Updating config', { body: req.body, adminId: req.user.userId });

    const { specialRate, ourFee } = req.body;

    // Check if at least one field is provided
    if (specialRate === undefined && ourFee === undefined) {
      logger.validation('No fields provided for update');
      return res.status(400).json({
        error: 'ValidationError',
        message: 'At least one field (specialRate or ourFee) is required'
      });
    }

    // Prepare update data
    const updateData = {};
    
    if (specialRate !== undefined) {
      const numSpecialRate = Number(specialRate);
      if (isNaN(numSpecialRate)) {
        logger.validation('Invalid specialRate format', { specialRate });
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Special rate must be a valid number'
        });
      }
      updateData.specialRate = numSpecialRate;
    }

    if (ourFee !== undefined) {
      const numOurFee = Number(ourFee);
      if (isNaN(numOurFee)) {
        logger.validation('Invalid ourFee format', { ourFee });
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Our fee must be a valid number'
        });
      }
      updateData.ourFee = numOurFee;
    }

    // Find and update config
    const config = await Config.findOne({});
    
    if (!config) {
      logger.warn('Config not found for update');
      return res.status(404).json({
        error: 'NotFound',
        message: 'Configuration not found. Create it first.'
      });
    }

    // Update config
    Object.assign(config, updateData);
    await config.save();

    logger.success('Config updated successfully', { configId: config.configId });

    return res.status(200).json({
      message: 'Config updated successfully',
      config
    });

  } catch (error) {
    logger.error('Update config error', { 
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

