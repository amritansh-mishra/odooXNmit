const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { Op } = require('sequelize');
const User = require('../models/User');
const { requireAuth } = require('../middlewares/jwtAuth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Rate limiters specifically for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15mins
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{9,}$/;


router.post(
  '/signup',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('loginId')
      .trim()
      .isLength({ min: 6, max: 12 })
      .withMessage('Login ID must be 6-12 characters'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password')
      .matches(passwordPolicy)
      .withMessage('Password must be >8 chars and include lower, upper, number, and special char'),
    body('reenteredPassword').custom((value, { req }) => {
      if (value !== req.body.password) throw new Error('Passwords do not match');
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { name, loginId, email, password } = req.body;

    try {
      // if user already exists
      let user = await User.findOne({ 
        where: { 
          [Op.or]: [{ loginId }, { email: email.toLowerCase() }] 
        } 
      });
      if (user) {
        return res.status(400).json({ message: 'User with this Login ID or Email already exists.' });
      }

      // password hashing and creation 
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      // Save user (role defaults to invoicing)
      user = await User.create({ name, loginId, email: email.toLowerCase(), password: hashed });

      res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
      console.error('Signup Error:', error);
      res.status(500).send('Server Error');
    }
  }
);


router.post(
  '/login',
  authLimiter,
  [
    body('loginId').trim().notEmpty().withMessage('Login ID is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { loginId, password } = req.body;
    
    // Debug logging
    console.log('Login attempt:', { loginId, passwordLength: password?.length });

    try {
      const user = await User.findOne({ where: { loginId } });
      console.log('User found:', user ? { id: user.id, loginId: user.loginId, name: user.name } : 'No user found');
      
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }

      const payload = { user: { id: user.id, name: user.name, role: user.role } };

      jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) {
          console.error('JWT Sign Error:', err);
          return res.status(500).send('Server Error');
        }
        res.json({ message: 'Logged in successfully!', token });
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).send('Server Error');
    }
  }
);

//  FORGOT PASSWORD
router.post(
  '/forgot-password',
  authLimiter,
  [body('loginId').trim().notEmpty().withMessage('Login ID is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { loginId } = req.body;
    const user = await User.findOne({ where: { loginId } });
    // Always respond success to avoid user enumeration
    if (!user) {
      return res.status(200).json({ message: 'If a user with that login ID exists, a password reset link has been sent.' });
    }

    // Create a 15-minute reset JWT with purpose claim
    const resetToken = jwt.sign({ sub: user.id, purpose: 'password_reset' }, JWT_SECRET, { expiresIn: '15m' });

    return res.status(200).json({ message: 'Password reset link generated.', resetToken });
  }
);

// Reset password (consume JWT reset token)
router.post(
  '/reset-password',
  authLimiter,
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .matches(passwordPolicy)
      .withMessage('Password must be >8 chars and include lower, upper, number, and special char'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { token, password } = req.body;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.purpose !== 'password_reset') {
        return res.status(400).json({ message: 'Invalid reset token' });
      }

      const userId = decoded.sub;
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(400).json({ message: 'Invalid reset token' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      res.json({ message: 'Password has been reset successfully.' });
    } catch (e) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
  }
);

// Get current user profile
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });
  res.json({ user });
});

module.exports = router;
