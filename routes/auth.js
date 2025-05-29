const express = require('express');
const { verifyToken } = require('../middleware/auth');
const {
  register,
  login,
  logout,
  refresh,
  me
} = require('../controllers/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

// Protected routes
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, me);

module.exports = router; 