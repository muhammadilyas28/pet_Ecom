const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'petdam',
    password: '123456789',
    port: 5432,
});

async function initializeDatabase() {
    try {
        // Read the SQL file
        const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');

        // Connect to database
        const client = await pool.connect();

        try {
            // Execute the SQL commands
            await client.query(sql);
            console.log('Database initialized successfully');
        } finally {
            // Release the client back to the pool
            client.release();
        }
    } catch (err) {
        console.error('Error initializing database:', err);
        throw err;
    } finally {
        // Close the pool
        await pool.end();
    }
}

// Run the initialization
initializeDatabase().catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
}); 