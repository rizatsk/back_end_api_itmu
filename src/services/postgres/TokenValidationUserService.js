const InvariantError = require("../../exceptions/InvariantError");
const check10minutes = require("../../utils/check10minutes");

class TokenValidationUserService {
    constructor({ pool }) {
        this._pool = pool;
    }

    async addToken({ userId, token }) {
        const condition = await this.checkAddOrUpdateToken(userId);
        let query;
        switch (condition) {
            case 'insert':
                query = {
                    text: `INSERT INTO token_validation_users(user_id, token) 
                        VALUES($1, $2) RETURNING user_id`,
                    values: [userId, token],
                };
                break;

            case 'update':
                query = {
                    text: `UPDATE token_validation_users SET token = $2,
                        created_at = $3 WHERE user_id = $1`,
                    values: [userId, token, new Date()],
                };
                break;
        }

        await this._pool.query(query);
    }

    async checkAddOrUpdateToken(userId) {
        const query = {
            text: `SELECT user_id, created_at FROM token_validation_users WHERE user_id = $1`,
            values: [userId],
        };

        const result = await this._pool.query(query);

        if (result.rowCount) {
            const condition = check10minutes(result.rows[0].created_at)
            if (!condition.status)
                throw new InvariantError((`Anda bisa melakukan request setelah ${condition.minutes} menit ${condition.second} detik kemudian`));
            return 'update'
        }

        return 'insert'
    }

    async getUserIdByToken(token) {
        const query = {
            text: `SELECT user_id FROM token_validation_users WHERE token = $1`,
            values: [token],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) return false;

        return result.rows[0].user_id
    }

    async deleteToken(token) {
        const query = {
            text: `DELETE FROM token_validation_users WHERE token = $1`,
            values: [token],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) return false;

        return true;
    }
}

module.exports = TokenValidationUserService;
