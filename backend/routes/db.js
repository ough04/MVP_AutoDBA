const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const mysql = require('mysql2/promise');

router.post('/', verifyToken, async (req, res) => {
  const { host, port, user, password, database } = req.body || {};

  console.log('✅ Received req.body:', req.body);

  // Field-by-field validation to allow "" but reject undefined
  const requiredFields = { host, port, user, password, database };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (value === undefined) {
      console.log(`❌ Missing field: ${key}`);
      return res.status(400).json({ message: `Field '${key}' is required.` });
    }
  }

  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database
    });

    const [tables] = await connection.query(`SHOW TABLES`);
    await connection.end();

    console.log('✅ Connected. Found tables:', tables);
    return res.status(200).json({ message: 'Connection successful.', tables });
  } catch (err) {
    const msg = err.message.toLowerCase();

    if (msg.includes('access denied')) {
      return res.status(403).json({ message: 'Invalid database username or password.' });
    } else if (msg.includes('unknown database')) {
      return res.status(404).json({ message: 'Specified database not found.' });
    } else if (msg.includes('connect') || msg.includes('timeout')) {
      return res.status(504).json({ message: 'Connection timed out. Try again later.' });
    } else {
      console.error('❌ DB connection error:', err);
      return res.status(500).json({ message: 'Unable to connect to database. Check credentials or server availability.' });
    }
  }
});

module.exports = router;
