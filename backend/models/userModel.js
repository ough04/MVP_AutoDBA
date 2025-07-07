// Import the MySQL connection pool
const db = require('../utils/db');

/**
 * Create a new user in the 'users' table.
 * @param {string} email - The user's email address.
 * @param {string} passwordHash - The hashed password.
 * @returns {number} The newly created user ID.
 */
async function createUser(email, passwordHash) {
  const [result] = await db.execute(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, passwordHash]
  );
  return result.insertId;
}

/**
 * Find a user by their email.
 * @param {string} email - The email to search for.
 * @returns {object|null} The user record if found, or null.
 */
async function findUserByEmail(email) {
  const [rows] = await db.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0]; // return undefined if not found
}

// Export the functions so they can be used in the controller
module.exports = {
  createUser,
  findUserByEmail
};
