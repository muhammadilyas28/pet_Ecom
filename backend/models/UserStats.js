const pool = require('../config/db');

class UserStats {
    static async getByUserId(userId) {
        try {
            const result = await pool.query(
                `SELECT * FROM user_stats WHERE user_id = $1`,
                [userId]
            );
            return result.rows[0] || {
                user_id: userId,
                total_sales: 0,
                total_purchases: 0,
                active_listings: 0,
                total_earnings: 0
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }

    static async updateStats(userId, stats) {
        try {
            const {
                total_sales,
                total_purchases,
                active_listings,
                total_earnings
            } = stats;

            const result = await pool.query(
                `INSERT INTO user_stats 
                (user_id, total_sales, total_purchases, active_listings, total_earnings, last_updated)
                VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id)
                DO UPDATE SET
                    total_sales = $2,
                    total_purchases = $3,
                    active_listings = $4,
                    total_earnings = $5,
                    last_updated = CURRENT_TIMESTAMP
                RETURNING *`,
                [userId, total_sales, total_purchases, active_listings, total_earnings]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error updating user stats:', error);
            throw error;
        }
    }

    static async addPurchase(userId, listingId, price) {
        try {
            // Start a transaction
            await pool.query('BEGIN');

            // Add purchase to history
            await pool.query(
                `INSERT INTO purchase_history 
                (user_id, listing_id, price)
                VALUES ($1, $2, $3)`,
                [userId, listingId, price]
            );

            // Update user stats
            const stats = await this.getByUserId(userId);
            stats.total_purchases += 1;
            stats.total_earnings += parseFloat(price);
            await this.updateStats(userId, stats);

            // Update listing status
            await pool.query(
                `UPDATE pet_listings 
                SET status = 'sold', 
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = $1`,
                [listingId]
            );

            await pool.query('COMMIT');
            return stats;
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('Error adding purchase:', error);
            throw error;
        }
    }

    static async getPurchaseHistory(userId) {
        try {
            const result = await pool.query(
                `SELECT 
                    ph.*,
                    pl.breed,
                    pl.pet_type,
                    pl.photos,
                    u.name as seller_name
                FROM purchase_history ph
                LEFT JOIN pet_listings pl ON ph.listing_id = pl.id
                LEFT JOIN users u ON pl.user_id = u.id
                WHERE ph.user_id = $1
                ORDER BY ph.purchase_date DESC
                LIMIT 5`,
                [userId]
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting purchase history:', error);
            throw error;
        }
    }
}

module.exports = UserStats; 