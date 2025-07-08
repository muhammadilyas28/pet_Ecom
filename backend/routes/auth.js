const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        // Validate password requirements
        const passwordStr = String(password);
        if (passwordStr.length < 8 ||
            !/[A-Z]/.test(passwordStr) ||
            !/[a-z]/.test(passwordStr) ||
            !/[0-9]/.test(passwordStr)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers'
            });
        }

        // Create user
        const user = await User.create(name, email, passwordStr);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.message === 'Email already exists') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        // Attempt login
        const user = await User.login(email, password);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        if (error.message === 'Invalid email or password') {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router; 