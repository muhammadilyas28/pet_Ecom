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

// @route   POST /api/listings
// @desc    Create a new pet listing
// @access  Private
router.post('/', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const petData = req.body;

        console.log('Creating listing with data:', { userId, petData });

        // Validate required fields
        const requiredFields = ['pet_type', 'pet_gender', 'breed', 'age', 'price', 'description', 'photos'];
        const missingFields = requiredFields.filter(field => {
            const value = petData[field];
            return value === undefined || value === null ||
                (Array.isArray(value) && value.length === 0) ||
                (typeof value === 'string' && value.trim() === '');
        });

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate price
        if (isNaN(petData.price) || petData.price <= 0) {
            return res.status(400).json({
                message: 'Price must be a positive number'
            });
        }

        // Validate photos array
        if (!Array.isArray(petData.photos) || petData.photos.length === 0) {
            return res.status(400).json({
                message: 'At least one photo is required'
            });
        }

        const result = await pool.query(
            `INSERT INTO pet_listings (user_id, pet_type, pet_gender, breed, age, price, description, photos)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, user_id, pet_type, pet_gender, breed, age, price, description, photos, status, created_at, updated_at`,
            [userId, petData.pet_type, petData.pet_gender, petData.breed, petData.age, petData.price, petData.description, petData.photos]
        );

        const listing = result.rows[0];
        console.log('Listing created:', listing);

        res.status(201).json({
            message: 'Pet listing created successfully',
            listing
        });
    } catch (error) {
        console.error('Error in create listing route:', error);
        res.status(500).json({
            message: 'Server error while creating listing',
            error: error.message
        });
    }
});

// @route   GET /api/listings/user
// @desc    Get all listings for logged in user
// @access  Private
router.get('/user', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                id,
                user_id,
                pet_type,
                pet_gender,
                breed,
                age,
                price,
                description,
                photos,
                status,
                created_at,
                updated_at
            FROM pet_listings
            WHERE user_id = $1
            ORDER BY created_at DESC`,
            [req.userId]
        );

        // Format the response
        const formattedListings = result.rows.map(listing => ({
            ...listing,
            price: parseFloat(listing.price).toFixed(2), // Ensure consistent price format
            created_at: new Date(listing.created_at).toISOString(),
            updated_at: new Date(listing.updated_at).toISOString()
        }));

        res.json(formattedListings);
    } catch (error) {
        console.error('Error in get user listings route:', error);
        res.status(500).json({ message: 'Server error while fetching listings' });
    }
});

// @route   GET /api/listings
// @desc    Get all active listings
// @access  Public
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                id,
                user_id,
                pet_type,
                pet_gender,
                breed,
                age,
                price,
                description,
                photos,
                status,
                created_at
            FROM pet_listings
            WHERE status = 'active'
            ORDER BY created_at DESC`
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ message: 'Server error while fetching listings' });
    }
});

// @route   GET /api/listings/:id
// @desc    Get listing by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                id,
                user_id,
                pet_type,
                pet_gender,
                breed,
                age,
                price,
                description,
                photos,
                status,
                created_at,
                updated_at
            FROM pet_listings
            WHERE id = $1`,
            [req.params.id]
        );

        const listing = result.rows[0];
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        res.json(listing);
    } catch (error) {
        console.error('Error in get listing route:', error);
        res.status(500).json({ message: 'Server error while fetching listing' });
    }
});

// @route   PUT /api/listings/:id
// @desc    Update a listing
// @access  Private
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE pet_listings
             SET
                pet_type = $1,
                pet_gender = $2,
                breed = $3,
                age = $4,
                price = $5,
                description = $6,
                photos = $7,
                status = $8,
                updated_at = NOW()
             WHERE id = $9 AND user_id = $10
             RETURNING id, user_id, pet_type, pet_gender, breed, age, price, description, photos, status, created_at, updated_at`,
            [req.body.pet_type, req.body.pet_gender, req.body.breed, req.body.age, req.body.price, req.body.description, req.body.photos, req.body.status, req.params.id, req.userId]
        );

        const listing = result.rows[0];
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found or unauthorized' });
        }
        res.json({
            message: 'Listing updated successfully',
            listing
        });
    } catch (error) {
        console.error('Error in update listing route:', error);
        res.status(500).json({ message: 'Server error while updating listing' });
    }
});

// @route   DELETE /api/listings/:id
// @desc    Delete a listing
// @access  Private
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM pet_listings WHERE id = $1 AND user_id = $2 RETURNING id, user_id, pet_type, pet_gender, breed, age, price, description, photos, status, created_at, updated_at`,
            [req.params.id, req.userId]
        );

        const listing = result.rows[0];
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found or unauthorized' });
        }
        res.json({
            message: 'Listing deleted successfully',
            listing
        });
    } catch (error) {
        console.error('Error in delete listing route:', error);
        res.status(500).json({ message: 'Server error while deleting listing' });
    }
});

module.exports = router; 