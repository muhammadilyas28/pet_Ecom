const express = require('express');
const router = express.Router();
const PetListing = require('../models/PetListing');

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

        const listing = await PetListing.create(userId, petData);
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
        const listings = await PetListing.getByUserId(req.userId);
        res.json(listings);
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
        const listings = await PetListing.getAllActive();
        res.json(listings);
    } catch (error) {
        console.error('Error in get all listings route:', error);
        res.status(500).json({ message: 'Server error while fetching listings' });
    }
});

// @route   GET /api/listings/:id
// @desc    Get listing by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const listing = await PetListing.getById(req.params.id);
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
        const listing = await PetListing.update(req.params.id, req.userId, req.body);
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
        const listing = await PetListing.delete(req.params.id, req.userId);
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