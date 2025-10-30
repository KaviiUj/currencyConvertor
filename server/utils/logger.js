const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const errorLogPath = path.join(logsDir, 'error.log');
const combinedLogPath = path.join(logsDir, 'combined.log');
const requestLogPath = path.join(logsDir, 'request.log');

/**
 * Format timestamp
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Write to file
 */
const writeToFile = (filePath, message) => {
  fs.appendFileSync(filePath, message + '\n', 'utf8');
};

/**
 * Format log message
 */
const formatLog = (level, message, data = null) => {
  const timestamp = getTimestamp();
  let logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    logMessage += '\n' + JSON.stringify(data, null, 2);
  }
  
  return logMessage;
};

/**
 * Console logger with colors
 */
const consoleLog = (level, message, data = null) => {
  const colors = {
    INFO: '\x1b[36m',    // Cyan
    WARN: '\x1b[33m',    // Yellow
    ERROR: '\x1b[31m',   // Red
    SUCCESS: '\x1b[32m', // Green
    DEBUG: '\x1b[35m',   // Magenta
    RESET: '\x1b[0m'
  };

  const color = colors[level] || colors.RESET;
  const timestamp = getTimestamp();
  
  console.log(`${color}[${timestamp}] [${level}]${colors.RESET} ${message}`);
  
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

/**
 * Logger object with different log levels
 */
const logger = {
  /**
   * Info logs
   */
  info: (message, data = null) => {
    const logMessage = formatLog('INFO', message, data);
    consoleLog('INFO', message, data);
    writeToFile(combinedLogPath, logMessage);
  },

  /**
   * Success logs
   */
  success: (message, data = null) => {
    const logMessage = formatLog('SUCCESS', message, data);
    consoleLog('SUCCESS', message, data);
    writeToFile(combinedLogPath, logMessage);
  },

  /**
   * Warning logs
   */
  warn: (message, data = null) => {
    const logMessage = formatLog('WARN', message, data);
    consoleLog('WARN', message, data);
    writeToFile(combinedLogPath, logMessage);
    writeToFile(errorLogPath, logMessage);
  },

  /**
   * Error logs
   */
  error: (message, data = null) => {
    const logMessage = formatLog('ERROR', message, data);
    consoleLog('ERROR', message, data);
    writeToFile(combinedLogPath, logMessage);
    writeToFile(errorLogPath, logMessage);
  },

  /**
   * Debug logs (for development)
   */
  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = formatLog('DEBUG', message, data);
      consoleLog('DEBUG', message, data);
      writeToFile(combinedLogPath, logMessage);
    }
  },

  /**
   * Request logs with detailed information
   */
  request: (req, res, responseTime = null) => {
    const timestamp = getTimestamp();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    const statusCode = res.statusCode;
    
    const logData = {
      timestamp,
      method,
      url,
      ip,
      statusCode,
      responseTime: responseTime ? `${responseTime}ms` : null,
      userAgent,
      headers: req.headers,
      query: req.query,
      params: req.params,
      body: method === 'POST' || method === 'PUT' || method === 'PATCH' ? req.body : null
    };

    const logMessage = formatLog('REQUEST', `${method} ${url}`, logData);
    
    console.log(`\n${logMessage}\n`);
    writeToFile(requestLogPath, logMessage);
    writeToFile(combinedLogPath, logMessage);
  },

  /**
   * Response logs
   */
  response: (req, res, data = null, responseTime = null) => {
    const timestamp = getTimestamp();
    const statusCode = res.statusCode;
    
    const logData = {
      timestamp,
      url: req.originalUrl || req.url,
      statusCode,
      responseTime: responseTime ? `${responseTime}ms` : null,
      response: data
    };

    const logMessage = formatLog('RESPONSE', `Status: ${statusCode}`, logData);
    
    writeToFile(combinedLogPath, logMessage);
    
    if (statusCode >= 400) {
      writeToFile(errorLogPath, logMessage);
    }
  },

  /**
   * Database query logs
   */
  db: (operation, collection, data = null) => {
    const message = `Database ${operation} on ${collection}`;
    logger.info(message, data);
  },

  /**
   * Authentication logs
   */
  auth: (message, data = null) => {
    logger.info(`[AUTH] ${message}`, data);
  },

  /**
   * Validation logs
   */
  validation: (message, data = null) => {
    logger.warn(`[VALIDATION] ${message}`, data);
  }
};

module.exports = logger;

