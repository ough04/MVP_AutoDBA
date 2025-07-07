const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware to verify JWT token for protected routes.
 */
module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];

  // Check if the header exists
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  // Expected format: 'Bearer <token>'
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Malformed token.' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    // Token is valid; attach user info to request
    req.user = decoded;
    next();
  });
};
