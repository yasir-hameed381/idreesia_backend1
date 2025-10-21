const winston = require('winston');

// Serverless-friendly logger configuration
// In production (Vercel), logs MUST go to console (not files)
// Vercel captures console output in its log system

const transports = [];

// In serverless/production: ONLY use console (file system is read-only)
if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  );
} else {
  // In development: use both files and console
  transports.push(
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports,
});

logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
