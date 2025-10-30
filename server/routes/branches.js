const express = require('express');
const Branch = require('../models/Branch');
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

// POST /api/branches - Create branch (Admin only)
router.post('/', adminOnly, async (req, res) => {
  try {
    logger.info('Creating branch', { body: req.body, adminId: req.user.userId });
    
    const { branchName } = req.body;

    // Validate required fields
    if (!branchName) {
      logger.validation('Missing branch name');
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Branch name is required'
      });
    }

    // Normalize branch name
    const normalizedBranchName = String(branchName).trim();

    // Check for duplicate branch
    const existing = await Branch.findOne({ branchName: normalizedBranchName });
    
    if (existing) {
      logger.warn('Duplicate branch found', { branchName: normalizedBranchName });
      return res.status(409).json({
        error: 'Conflict',
        message: 'Branch with this name already exists'
      });
    }

    // Create branch
    const branch = new Branch({
      branchName: normalizedBranchName,
      isActive: true
    });

    await branch.save();

    logger.success('Branch created successfully', { branchId: branch.branchId, branchName: branch.branchName });

    return res.status(201).json({
      message: 'Branch created successfully',
      branch
    });

  } catch (error) {
    // Handle duplicate key errors explicitly
    if (error && error.code === 11000) {
      logger.error('Database duplicate key error', { 
        code: error.code, 
        keyPattern: error.keyPattern 
      });
      return res.status(409).json({
        error: 'Conflict',
        message: 'Branch with this name already exists'
      });
    }

    logger.error('Create branch error', { 
      message: error.message, 
      stack: error.stack 
    });
    return res.status(500).json({
      error: 'ServerError',
      message: 'An unexpected error occurred'
    });
  }
});

// GET /api/branches - Get all branches (Admin only)
router.get('/', adminOnly, async (req, res) => {
  try {
    logger.info('Fetching all branches', { adminId: req.user.userId });

    const branches = await Branch.find({});

    logger.success(`Retrieved ${branches.length} branches`);

    return res.status(200).json({
      message: 'Branches retrieved successfully',
      count: branches.length,
      branches
    });

  } catch (error) {
    logger.error('Get branches error', { 
      message: error.message, 
      stack: error.stack 
    });
    return res.status(500).json({
      error: 'ServerError',
      message: 'An unexpected error occurred'
    });
  }
});

// PATCH /api/branches/activate-deactivate - Activate/Deactivate branch (Admin only)
router.patch('/activate-deactivate', adminOnly, async (req, res) => {
  try {
    logger.info('Activating/deactivating branch', { query: req.query, adminId: req.user.userId });
    
    const { branchId, status } = req.query;

    // Validate required fields
    if (!branchId || status === undefined) {
      logger.validation('Missing branchId or status', { branchId: !!branchId, status: status !== undefined });
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Branch ID and status are required as query parameters'
      });
    }

    // Validate status value
    const isActive = status === 'true' || status === '1' || status === true;
    
    if (status !== 'true' && status !== '1' && status !== 'false' && status !== '0' && status !== true && status !== false) {
      logger.validation('Invalid status value', { status });
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Status must be true, false, 1, or 0'
      });
    }

    // Find and update branch
    const branch = await Branch.findById(branchId);
    
    if (!branch) {
      logger.warn('Branch not found', { branchId });
      return res.status(404).json({
        error: 'NotFound',
        message: 'Branch not found'
      });
    }

    // Update status
    branch.isActive = isActive;
    await branch.save();

    const action = isActive ? 'activated' : 'deactivated';
    logger.success(`Branch ${action} successfully`, { branchId, status: isActive });

    return res.status(200).json({
      message: `Branch ${action} successfully`,
      branch
    });

  } catch (error) {
    logger.error('Activate/deactivate branch error', { 
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

