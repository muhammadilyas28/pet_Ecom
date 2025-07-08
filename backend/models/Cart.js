const pool = require('../config/db');

class Cart {
    static async addItem(userId, listingId) {
        try {
            // Check if item already exists in cart
            const existingItem = await pool.query(
                `SELECT * FROM cart_items WHERE user_id = $1 AND listing_id = $2`,
                [userId, listingId]
            );

            if (existingItem.rows.length > 0) {
                return existingItem.rows[0];
            }

            // Add new item to cart
            const result = await pool.query(
                `INSERT INTO cart_items (user_id, listing_id)
                VALUES ($1, $2)
                RETURNING *`,
                [userId, listingId]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error adding item to cart:', error);
            throw error;
        }
    }

    static async getCartItems(userId) {
        try {
            const result = await pool.query(
                `SELECT 
                    ci.*,
                    pl.pet_type,
                    pl.pet_gender,
                    pl.breed,
                    pl.age,
                    pl.price,
                    pl.description,
                    pl.photos
                FROM cart_items ci
                JOIN pet_listings pl ON ci.listing_id = pl.id
                WHERE ci.user_id = $1`,
                [userId]
            );

            return result.rows;
        } catch (error) {
            console.error('Error getting cart items:', error);
            throw error;
        }
    }

    static async removeItem(userId, listingId) {
        try {
            const result = await pool.query(
                `DELETE FROM cart_items 
                WHERE user_id = $1 AND listing_id = $2
                RETURNING *`,
                [userId, listingId]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error removing item from cart:', error);
            throw error;
        }
    }

    static async clearCart(userId) {
        try {
            await pool.query(
                `DELETE FROM cart_items WHERE user_id = $1`,
                [userId]
            );
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    }
}

module.exports = Cart; 