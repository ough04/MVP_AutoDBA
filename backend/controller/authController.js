const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../models/userModel');
require('dotenv').config();

/**
 * Handle user signup.
 * Validates input, checks for duplicates, hashes password, stores user.
 */
exports.signup = async (req, res) => {
  const { email, password } = req.body;

  // Validate presence
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Check for duplicate user
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    // Hash the password securely
    const passwordHash = await bcrypt.hash(password, 10);

    // Store user in DB
    const userId = await createUser(email, passwordHash);

    return res.status(201).json({ message: 'User created successfully.', userId });
  } catch (err) {
    console.error('Signup Error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * Handle user login.
 * Checks credentials and returns a signed JWT if valid.
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validate presence
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Sign JWT with user ID
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.status(200).json({ token });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
