const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
    const userId = req.headers['user-id'];
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    req.userId = userId;
    next();
};

// @route   GET /api/cart
// @desc    Get user's cart items
// @access  Private
router.get('/', requireAuth, async (req, res) => {
    try {
        const cartItems = await Cart.getCartItems(req.userId);
        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Server error while fetching cart' });
    }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', requireAuth, async (req, res) => {
    try {
        const { listingId } = req.body;
        if (!listingId) {
            return res.status(400).json({ message: 'Listing ID is required' });
        }

        const cartItem = await Cart.addItem(req.userId, listingId);
        res.json(cartItem);
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Server error while adding to cart' });
    }
});

// @route   DELETE /api/cart/:listingId
// @desc    Remove item from cart
// @access  Private
router.delete('/:listingId', requireAuth, async (req, res) => {
    try {
        const cartItem = await Cart.removeItem(req.userId, req.params.listingId);
        if (!cartItem) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
        res.json(cartItem);
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ message: 'Server error while removing from cart' });
    }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private
router.delete('/', requireAuth, async (req, res) => {
    try {
        await Cart.clearCart(req.userId);
        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: 'Server error while clearing cart' });
    }
});

module.exports = router; 