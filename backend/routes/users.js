const express = require('express');
const router = express.Router();
const UserStats = require('../models/UserStats');

// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
    const userId = req.headers['user-id'];
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    req.userId = userId;
    next();
};

// @route   GET /api/users/:userId/stats
// @desc    Get user statistics
// @access  Private
router.get('/:userId/stats', requireAuth, async (req, res) => {
    try {
        // Ensure user can only access their own stats
        if (req.userId !== req.params.userId) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const stats = await UserStats.getByUserId(req.userId);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Server error while fetching stats' });
    }
});

// @route   GET /api/users/:userId/purchases
// @desc    Get user purchase history
// @access  Private
router.get('/:userId/purchases', requireAuth, async (req, res) => {
    try {
        // Ensure user can only access their own purchase history
        if (req.userId !== req.params.userId) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const purchases = await UserStats.getPurchaseHistory(req.userId);
        res.json(purchases);
    } catch (error) {
        console.error('Error fetching purchase history:', error);
        res.status(500).json({ message: 'Server error while fetching purchase history' });
    }
});

// @route   POST /api/users/:userId/purchases
// @desc    Add a new purchase
// @access  Private
router.post('/:userId/purchases', requireAuth, async (req, res) => {
    try {
        // Ensure user can only add their own purchases
        if (req.userId !== req.params.userId) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const { listingId, price } = req.body;
        if (!listingId || !price) {
            return res.status(400).json({ message: 'Listing ID and price are required' });
        }

        const stats = await UserStats.addPurchase(req.userId, listingId, price);
        res.json(stats);
    } catch (error) {
        console.error('Error adding purchase:', error);
        res.status(500).json({ message: 'Server error while adding purchase' });
    }
});

module.exports = router; 