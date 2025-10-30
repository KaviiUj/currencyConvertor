const express = require('express');
const Staff = require('../models/Staff');
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

// POST /api/staff - Create staff (Admin only)
router.post('/', adminOnly, async (req, res) => {
  try {
    logger.info('Creating staff', { body: req.body, adminId: req.user.userId });
    
    const requiredFields = [
      'fName', 'lName', 'mobile', 'email', 'password', 'address', 'passportNumber', 'country'
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

    const { fName, lName, mobile, email, password, address, passportNumber, country, branchName, branchCode, branchId, isActive } = req.body;

    // Normalize fields
    const normalizedMobile = String(mobile).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPassport = String(passportNumber).trim().toUpperCase();

    // Check for duplicates by mobile, email, or passportNumber
    logger.debug('Checking for duplicate staff', { mobile: normalizedMobile, email: normalizedEmail, passportNumber: normalizedPassport });
    const existing = await Staff.findOne({ $or: [ { mobile: normalizedMobile }, { email: normalizedEmail }, { passportNumber: normalizedPassport } ] }).lean();
    
    if (existing) {
      logger.warn('Duplicate staff found', { mobile: normalizedMobile, email: normalizedEmail, passportNumber: normalizedPassport });
      return res.status(409).json({
        error: 'Conflict',
        message: 'Staff with the same mobile, email, or passportNumber already exists'
      });
    }

    // Create staff member
    const staff = new Staff({
      fName: String(fName).trim(),
      lName: String(lName).trim(),
      mobile: normalizedMobile,
      email: normalizedEmail,
      password: String(password),
      address: String(address).trim(),
      passportNumber: normalizedPassport,
      country: String(country).trim(),
      role: 96, // Always set to staff role
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      ...(branchName && { branchName: String(branchName).trim() }),
      ...(branchCode && { branchCode: String(branchCode).trim() }),
      ...(branchId && { branchId: String(branchId).trim() })
    });

    await staff.save();

    logger.success('Staff created successfully', { staffId: staff.staffId, email: staff.email });

    return res.status(201).json({
      message: 'Staff created successfully',
      staff
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

    logger.error('Create staff error', { 
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

// GET /api/staff - Get all staff (Admin only)
router.get('/', adminOnly, async (req, res) => {
  try {
    logger.info('Fetching all staff', { adminId: req.user.userId });

    const staff = await Staff.find({});

    logger.success(`Retrieved ${staff.length} staff members`);

    return res.status(200).json({
      message: 'Staff retrieved successfully',
      count: staff.length,
      staff
    });

  } catch (error) {
    logger.error('Get staff error', { 
      message: error.message, 
      stack: error.stack 
    });
    return res.status(500).json({
      error: 'ServerError',
      message: 'An unexpected error occurred'
    });
  }
});

// PATCH /api/staff/activate-deactivate - Activate/Deactivate staff (Admin only)
router.patch('/activate-deactivate', adminOnly, async (req, res) => {
  try {
    logger.info('Activating/deactivating staff', { query: req.query, adminId: req.user.userId });
    
    const { staffId, status } = req.query;

    // Validate required fields
    if (!staffId || status === undefined) {
      logger.validation('Missing staffId or status', { staffId: !!staffId, status: status !== undefined });
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Staff ID and status are required as query parameters'
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

    // Find and update staff
    const staff = await Staff.findById(staffId);
    
    if (!staff) {
      logger.warn('Staff not found', { staffId });
      return res.status(404).json({
        error: 'NotFound',
        message: 'Staff not found'
      });
    }

    // Update status
    staff.isActive = isActive;
    await staff.save();

    const action = isActive ? 'activated' : 'deactivated';
    logger.success(`Staff ${action} successfully`, { staffId, status: isActive });

    return res.status(200).json({
      message: `Staff ${action} successfully`,
      staff
    });

  } catch (error) {
    logger.error('Activate/deactivate staff error', { 
      message: error.message, 
      stack: error.stack 
    });
    return res.status(500).json({
      error: 'ServerError',
      message: 'An unexpected error occurred'
    });
  }
});

// GET /api/staff/delete - Delete staff (Admin only)
router.get('/delete', adminOnly, async (req, res) => {
  try {
    logger.info('Deleting staff', { query: req.query, adminId: req.user.userId });

    const { staffId } = req.query;

    if (!staffId) {
      logger.validation('Missing staffId');
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Staff ID is required'
      });
    }

    // Find and delete staff
    const staff = await Staff.findByIdAndDelete(staffId);
    
    if (!staff) {
      logger.warn('Staff not found for deletion', { staffId });
      return res.status(404).json({
        error: 'NotFound',
        message: 'Staff not found'
      });
    }

    logger.success('Staff deleted successfully', { staffId });

    return res.status(200).json({
      message: 'Staff deleted successfully',
      staffId
    });

  } catch (error) {
    logger.error('Delete staff error', { 
      message: error.message, 
      stack: error.stack 
    });
    return res.status(500).json({
      error: 'ServerError',
      message: 'An unexpected error occurred'
    });
  }
});

// POST /api/staff/update - Update staff (Admin only)
router.post('/update', adminOnly, async (req, res) => {
  try {
    logger.info('Updating staff', { body: req.body, adminId: req.user.userId });

    const { staffId, ...updateData } = req.body;

    if (!staffId) {
      logger.validation('Missing staffId');
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Staff ID is required'
      });
    }

    // Find staff
    const staff = await Staff.findById(staffId);
    
    if (!staff) {
      logger.warn('Staff not found for update', { staffId });
      return res.status(404).json({
        error: 'NotFound',
        message: 'Staff not found'
      });
    }

    // Prepare update fields (exclude fields that shouldn't be updated directly)
    const allowedFields = ['fName', 'lName', 'mobile', 'email', 'password', 'address', 'passportNumber', 'country', 'branchName', 'branchCode', 'branchId', 'isActive'];
    const fieldsToUpdate = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (field === 'mobile') {
          fieldsToUpdate[field] = String(updateData[field]).trim();
        } else if (field === 'email') {
          fieldsToUpdate[field] = String(updateData[field]).trim().toLowerCase();
        } else if (field === 'passportNumber') {
          fieldsToUpdate[field] = String(updateData[field]).trim().toUpperCase();
        } else if (field === 'password') {
          // If password is being updated, it will be hashed by the pre-save hook
          fieldsToUpdate[field] = String(updateData[field]);
        } else if (field === 'isActive') {
          fieldsToUpdate[field] = Boolean(updateData[field]);
        } else if (field === 'branchName' || field === 'branchCode' || field === 'branchId') {
          fieldsToUpdate[field] = String(updateData[field]).trim();
        } else {
          fieldsToUpdate[field] = String(updateData[field]).trim();
        }
      }
    }

    // Check for duplicates if mobile, email, or passportNumber is being updated
    if (fieldsToUpdate.mobile || fieldsToUpdate.email || fieldsToUpdate.passportNumber) {
      const duplicateQuery = { $or: [], _id: { $ne: staffId } };
      
      if (fieldsToUpdate.mobile) {
        duplicateQuery.$or.push({ mobile: fieldsToUpdate.mobile });
      }
      if (fieldsToUpdate.email) {
        duplicateQuery.$or.push({ email: fieldsToUpdate.email });
      }
      if (fieldsToUpdate.passportNumber) {
        duplicateQuery.$or.push({ passportNumber: fieldsToUpdate.passportNumber });
      }

      if (duplicateQuery.$or.length > 0) {
        const existing = await Staff.findOne(duplicateQuery);
        if (existing) {
          logger.warn('Duplicate staff found during update', { staffId });
          return res.status(409).json({
            error: 'Conflict',
            message: 'Staff with the same mobile, email, or passportNumber already exists'
          });
        }
      }
    }

    // Update staff
    Object.assign(staff, fieldsToUpdate);
    await staff.save();

    logger.success('Staff updated successfully', { staffId });

    return res.status(200).json({
      message: 'Staff updated successfully',
      staff
    });

  } catch (error) {
    if (error && error.code === 11000) {
      const key = Object.keys(error.keyPattern || {})[0] || 'unique field';
      logger.error('Database duplicate key error', { 
        code: error.code, 
        keyPattern: error.keyPattern 
      });
      return res.status(409).json({
        error: 'Conflict',
        message: `Duplicate value for ${key}`
      });
    }

    logger.error('Update staff error', { 
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

