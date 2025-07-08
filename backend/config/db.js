const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Validate required environment variables
// if (!process.env.DB_PASSWORD) {
//     console.error('DB_PASSWORD environment variable is required');
//     process.exit(1);
// }

// Create database connection pool with validated parameters
const pool = new Pool({
    user: String(process.env.DB_USER || 'postgres'),
    password: String(process.env.DB_PASSWORD || '123456789'),
    host: String(process.env.DB_HOST || 'localhost'),
    port: Number(process.env.DB_PORT || 5432),
    database: String(process.env.DB_NAME || 'petdam')
});

// Initialize database tables
const initializeDatabase = async () => {
    try {
        // Read the initialization SQL script
        const initSQL = fs.readFileSync(path.join(__dirname, '..', 'db', 'init.sql'), 'utf8');

        // Execute the initialization script
        await pool.query(initSQL);
        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database tables:', error);
        throw error;
    }
};

// Test the connection and initialize database
pool.on('connect', async () => {
    console.log('Connected to PostgreSQL database');
    try {
        await initializeDatabase();
    } catch (error) {
        console.error('Failed to initialize database tables');
        process.exit(1);
    }
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool; 