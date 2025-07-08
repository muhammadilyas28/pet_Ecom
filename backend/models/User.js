const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async create(name, email, password) {
        try {
            // Validate inputs
            if (!name || !email || !password) {
                throw new Error('Name, email, and password are required');
            }

            // Ensure password is string
            const passwordStr = String(password);
            if (passwordStr.length < 8) {
                throw new Error('Password must be at least 8 characters long');
            }

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(passwordStr, salt);

            // Insert the user
            const result = await pool.query(
                'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
                [String(name), String(email), hashedPassword]
            );

            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique violation error code
                throw new Error('Email already exists');
            }
            console.error('Error creating user:', error);
            throw error;
        }
    }

    static async login(email, password) {
        try {
            // Find user by email
            const user = await this.findByEmail(email);
            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(String(password), user.password);
            if (!isValidPassword) {
                throw new Error('Invalid email or password');
            }

            // Return user data without password
            const { password: _, ...userData } = user;
            return userData;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [String(email)]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    }
}

module.exports = User; 