const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware: CORS + JSON parsing
app.use(cors());
app.use(express.json()); // ✅ REQUIRED: to access req.body

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/connect-db', require('./routes/db'));
app.use('/audit', require('./routes/audit'));

// Health check
app.get('/', (req, res) => {
  res.send('AutoDBA API is running ✅');
});

module.exports = app;
