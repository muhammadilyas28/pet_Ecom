const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async findByEmail(email) {
        try {
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    static async create(userData) {
        const { name, email, password } = userData;

        try {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const result = await pool.query(
                `INSERT INTO users (name, email, password)
                VALUES ($1, $2, $3)
                RETURNING id, name, email`,
                [name, email, hashedPassword]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    static async validatePassword(inputPassword, hashedPassword) {
        return await bcrypt.compare(inputPassword, hashedPassword);
    }
}

module.exports = User; 