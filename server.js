// server.js - Vercel serverless entry point
// DON'T require src/index.js - that calls app.listen() which breaks on Vercel

// Set up Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// Import express app (without starting server)
const app = require('./src/config/express');

// Export for Vercel serverless
module.exports = app;
