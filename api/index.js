// api/index.js - Vercel Serverless Function Entry Point
// This is the proper way to deploy Express on Vercel

// Set up Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// Import the Express app (without starting a server)
const app = require('../src/config/express');

// Export as Vercel serverless function
// Vercel will automatically handle the HTTP server setup
module.exports = app;
