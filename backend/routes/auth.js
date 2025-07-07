const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

// POST /signup → Create a new user
router.post('/signup', authController.signup);

// POST /login → Authenticate and return JWT
router.post('/login', authController.login);

module.exports = router;
