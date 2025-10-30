const logger = require('../utils/logger');

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request immediately
  logger.request(req, res);

  // Store original end function
  const originalEnd = res.end;

  // Override end function to log response time
  res.end = function(chunk, encoding) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Update response headers if not already sent
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${responseTime}ms`);
    }

    // Call original end function
    originalEnd.call(this, chunk, encoding);

    // Log response
    logger.response(req, res, chunk ? JSON.parse(chunk.toString()) : null, responseTime);
  };

  next();
};

/**
 * Error logging middleware
 */
const errorLogger = (err, req, res, next) => {
  logger.error('Express Error Handler', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl || req.url,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    headers: req.headers
  });

  next(err);
};

module.exports = {
  requestLogger,
  errorLogger
};

