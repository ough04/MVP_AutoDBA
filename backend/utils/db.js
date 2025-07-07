const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: 'localhost',      // use your actual host if not localhost
  user: 'root',           // adjust to your MySQL username
  database: 'autodba',    // matches your `autodba.sql` dump
  password: '',           // adjust if you have a password
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
