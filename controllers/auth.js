// Authentication controller that handles user sign-up, sign-in, and sign-out functionality
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { generateTokens, verifyRefreshToken } from '../middleware/auth.js';

const router = express.Router();

// Store refresh tokens (consider using Redis in production)
const refreshTokens = new Set();

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      name
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    refreshTokens.add(refreshToken);

    // Return user data and tokens
    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    refreshTokens.add(refreshToken);

    // Return user data and tokens
    res.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // Remove refresh token
    refreshTokens.delete(refreshToken);
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token exists
    if (!refreshTokens.has(refreshToken)) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Verify and decode refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      refreshTokens.delete(refreshToken);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new tokens
    const tokens = generateTokens(user);
    
    // Replace old refresh token
    refreshTokens.delete(refreshToken);
    refreshTokens.add(tokens.refreshToken);

    res.json(tokens);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', me);

export default router;