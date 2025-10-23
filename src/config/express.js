const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('../api/routes/v1');
const error = require('../api/middlewares/error');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔓 Allow all origins (CORS)
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true, // set false if you don’t need cookies/auth headers
}));

app.options('*', cors());

// routes
app.use('/api', routes);

app.get('/', (req, res) => res.send('API running 🚀'));

// error handlers
app.use(error.converter);
app.use(error.notFound);
app.use(error.handler);

module.exports = app;
