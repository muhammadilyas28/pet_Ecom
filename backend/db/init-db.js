const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'petdam',
    password: process.env.DB_PASSWORD || '12345678',
    port: process.env.DB_PORT || 5432,
});

async function initializeDatabase() {
    try {
        // Read the main SQL file
        const initSql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');

        // Read the migration file
        const migrationSql = fs.readFileSync(path.join(__dirname, 'migration_add_seller_id.sql'), 'utf8');

        // Connect to database
        const client = await pool.connect();

        try {
            // Execute the main SQL commands
            await client.query(initSql);
            console.log('Database initialized successfully');

            // Execute the migration (this will safely add the seller_id column if it doesn't exist)
            try {
                await client.query(migrationSql);
                console.log('Migration applied successfully');
            } catch (migrationErr) {
                // If migration fails (e.g., column already exists), that's okay
                console.log('Migration note:', migrationErr.message);
            }
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