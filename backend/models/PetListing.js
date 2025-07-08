const pool = require('../config/db');

class PetListing {
    static async create(userId, petData) {
        try {
            const {
                pet_type,
                pet_gender,
                breed,
                age,
                price,
                description,
                photos
            } = petData;

            const result = await pool.query(
                `INSERT INTO pet_listings 
                (user_id, pet_type, pet_gender, breed, age, price, description, photos) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING *`,
                [userId, pet_type, pet_gender, breed, age, price, description, photos]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error creating pet listing:', error);
            throw error;
        }
    }

    static async getByUserId(userId) {
        try {
            const result = await pool.query(
                'SELECT * FROM pet_listings WHERE user_id = $1 ORDER BY created_at DESC',
                [userId]
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting user listings:', error);
            throw error;
        }
    }

    static async getById(id) {
        try {
            const result = await pool.query(
                'SELECT * FROM pet_listings WHERE id = $1',
                [id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error getting listing:', error);
            throw error;
        }
    }

    static async update(id, userId, updateData) {
        try {
            const fields = [];
            const values = [];
            let paramCount = 1;

            // Build dynamic update query
            Object.keys(updateData).forEach(key => {
                fields.push(`${key} = $${paramCount}`);
                values.push(updateData[key]);
                paramCount += 1;
            });

            // Add updated_at timestamp
            fields.push(`updated_at = CURRENT_TIMESTAMP`);

            // Add WHERE clause parameters
            values.push(id);
            values.push(userId);

            const query = `
                UPDATE pet_listings 
                SET ${fields.join(', ')} 
                WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
                RETURNING *
            `;

            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating listing:', error);
            throw error;
        }
    }

    static async delete(id, userId) {
        try {
            const result = await pool.query(
                'DELETE FROM pet_listings WHERE id = $1 AND user_id = $2 RETURNING *',
                [id, userId]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting listing:', error);
            throw error;
        }
    }

    static async getAllActive() {
        try {
            const result = await pool.query(
                `SELECT 
                pl.id,
                pl.user_id,
                pl.pet_type,
                pl.pet_gender,
                pl.breed,
                pl.age,
                pl.price,
                pl.description,
                pl.photos,
                pl.status,
                pl.created_at,
                u.name as seller_name,
                u.email as seller_email
            FROM pet_listings pl 
            JOIN users u ON pl.user_id = u.id 
            WHERE pl.status = 'active' 
            ORDER BY pl.created_at DESC`
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting active listings:', error);
            throw error;
        }
    }
}

module.exports = PetListing; 