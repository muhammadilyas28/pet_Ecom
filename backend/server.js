require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const listingsRouter = require('./routes/listings');
const usersRouter = require('./routes/users');
const cartRouter = require('./routes/cart');
const authRouter = require('./routes/auth');
const purchasesRouter = require('./routes/purchases');

const app = express();

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500', '*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'user-id', 'Authorization', 'Accept']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, '../images')));

// Routes - Auth route should be first
app.use('/api/auth', authRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/users', usersRouter);
app.use('/api/cart', cartRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 