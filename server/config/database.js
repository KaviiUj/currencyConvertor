const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME
    });
    
    logger.success(`MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', err => {
      logger.error('MongoDB Error', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB Disconnected');
    });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      logger.info('Closing MongoDB connection through app termination');
      await mongoose.connection.close();
      logger.success('MongoDB connection closed');
      process.exit(0);
    });
    
    return conn;
  } catch (error) {
    logger.error('MongoDB Connection Error', { message: error.message, stack: error.stack });
    process.exit(1);
  }
};

module.exports = connectDB;

