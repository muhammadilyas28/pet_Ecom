const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
    const userId = req.headers['user-id'];
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    req.userId = userId;
    next();
};

// @route   POST /api/purchases
// @desc    Create a new purchase record
// @access  Private
router.post('/', requireAuth, async (req, res) => {
    try {
        const { listing_id, seller_id, price, status } = req.body;
        const buyer_id = req.userId; // Get buyer's ID from auth middleware

        // Validate required fields
        if (!listing_id || !seller_id || !price) {
            return res.status(400).json({
                message: 'Listing ID, seller ID, and price are required'
            });
        }

        // Start a transaction
        await pool.query('BEGIN');

        try {
            // Insert purchase record
            const purchaseResult = await pool.query(
                `INSERT INTO purchase_history (user_id, seller_id, listing_id, price, status, purchase_date)
                 VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
                 RETURNING id, user_id, seller_id, listing_id, price, status, purchase_date`,
                [buyer_id, seller_id, listing_id, price, status || 'completed']
            );

            // Update listing status to sold
            await pool.query(
                `UPDATE pet_listings 
                 SET status = 'sold', updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $1`,
                [listing_id]
            );

            // Update seller's stats
            await pool.query(
                `INSERT INTO user_stats (user_id, total_sales, total_earnings)
                 VALUES ($1, 1, $2)
                 ON CONFLICT (user_id)
                 DO UPDATE SET 
                    total_sales = user_stats.total_sales + 1,
                    total_earnings = user_stats.total_earnings + $2,
                    last_updated = CURRENT_TIMESTAMP`,
                [seller_id, price]
            );

            // Commit transaction
            await pool.query('COMMIT');

            const purchase = purchaseResult.rows[0];

            res.status(201).json({
                message: 'Purchase recorded successfully',
                purchase
            });
        } catch (error) {
            // Rollback in case of error
            await pool.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error recording purchase:', error);
        res.status(500).json({
            message: 'Server error while recording purchase',
            error: error.message
        });
    }
});

// @route   GET /api/purchases/user
// @desc    Get purchase history for logged in user
// @access  Private
router.get('/user', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                ph.id,
                ph.listing_id,
                ph.price,
                ph.status,
                ph.purchase_date,
                pl.pet_type,
                pl.breed,
                pl.photos
             FROM purchase_history ph
             LEFT JOIN pet_listings pl ON ph.listing_id = pl.id
             WHERE ph.user_id = $1
             ORDER BY ph.purchase_date DESC`,
            [req.userId]
        );

        // Format the response
        const formattedPurchases = result.rows.map(purchase => ({
            ...purchase,
            price: parseFloat(purchase.price).toFixed(2),
            purchase_date: new Date(purchase.purchase_date).toISOString()
        }));

        res.json(formattedPurchases);
    } catch (error) {
        console.error('Error fetching purchase history:', error);
        res.status(500).json({ message: 'Server error while fetching purchase history' });
    }
});

// @route   GET /api/purchases/stats
// @desc    Get purchase statistics for logged in user
// @access  Private
router.get('/stats', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_purchases,
                SUM(price) as total_spent,
                COUNT(DISTINCT listing_id) as unique_items
             FROM purchase_history
             WHERE user_id = $1 AND status = 'completed'`,
            [req.userId]
        );

        const stats = result.rows[0];
        res.json({
            totalPurchases: parseInt(stats.total_purchases),
            totalSpent: parseFloat(stats.total_spent || 0).toFixed(2),
            uniqueItems: parseInt(stats.unique_items)
        });
    } catch (error) {
        console.error('Error fetching purchase stats:', error);
        res.status(500).json({ message: 'Server error while fetching purchase statistics' });
    }
});

module.exports = router; 