-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create pet_listings table if it doesn't exist
CREATE TABLE IF NOT EXISTS pet_listings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pet_type VARCHAR(50) NOT NULL,
    pet_gender VARCHAR(20) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    age VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    photos TEXT[] NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create cart_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    listing_id INTEGER REFERENCES pet_listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

-- Create user_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_sales INTEGER DEFAULT 0,
    total_purchases INTEGER DEFAULT 0,
    active_listings INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create purchase_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS purchase_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    listing_id INTEGER REFERENCES pet_listings(id) ON DELETE SET NULL,
    price DECIMAL(10,2) NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'completed'
);

-- Add some sample data for testing
INSERT INTO users (name, email, password) 
VALUES ('Test User', 'test@example.com', '$2a$10$6KqMR.5rqrS1uFEDhXVK6eUVHX1VL5LHxmJ.wZ4XQYz7wAyd4OTlW')
ON CONFLICT (email) DO NOTHING;

-- Add sample pet listings
INSERT INTO pet_listings (user_id, pet_type, pet_gender, breed, age, price, description, photos, status)
SELECT 
    (SELECT id FROM users WHERE email = 'test@example.com'),
    'Dog',
    'Male',
    'Golden Retriever',
    '2 years',
    50000.00,
    'Friendly and well-trained Golden Retriever looking for a loving home.',
    ARRAY['/images/dogs/golden1.jpg', '/images/dogs/golden2.jpg'],
    'active'
WHERE NOT EXISTS (
    SELECT 1 FROM pet_listings WHERE breed = 'Golden Retriever'
); 