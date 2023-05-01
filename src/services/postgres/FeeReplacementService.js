const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class FeeReplacementService {
    constructor({ pool }) {
        this._pool = pool;
    }

    async addFeeReplacement({ name, price }) {
        await this.checkAddNameFeeReplacement(name);

        const id = `fee_replacement-${nanoid(10)}`
        const query = {
            text: `INSERT INTO fee_replacements(fee_replacement_id,
                name, price)
                VALUES($1, $2, $3) RETURNING fee_replacement_id`,
            values: [id, name, price]
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) throw new InvariantError('Gagal insert fee replacement')

        return result.rows[0].fee_replacement_id;
    }

    async checkAddNameFeeReplacement(name) {
        const query = {
            text: 'SELECT fee_replacement_id FROM fee_replacements WHERE name = $1',
            values: [name]
        };

        const result = await this._pool.query(query);
        if (result.rowCount) throw new InvariantError('Name fee replacements is available')
    }

    async getCountFeeReplacements(search) {
        search = search ? `%${search}%` : '%%';
        const query = {
            text: `SELECT count(*) AS count FROM fee_replacements WHERE LOWER(name) ILIKE $1`,
            values: [search]
        };

        const result = await this._pool.query(query);

        return result.rows[0].count;
    }

    async getFeeReplacements({ search, limit, offset }) {
        search = search ? `%${search}%` : '%%';
        const query = {
            text: `SELECT *
                FROM fee_replacements
                WHERE LOWER(name) LIKE $3
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2`,
            values: [limit, offset, search],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async getFeeReplacementsForProduct() {
        const query = {
            text: `SELECT fee_replacement_id,
                name, price
                FROM fee_replacements`,
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async getFeeReplacementById(id) {
        const query = {
            text: `SELECT fee_replacement_id,
                name, price
                FROM fee_replacements WHERE fee_replacement_id = $1`,
            values: [id]
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) throw new NotFoundError('Fee replacement tidak ditemukan')

        return result.rows[0];
    }

    async putFeeReplacementById({ feeReplacementId, name, price }) {
        await this.checkPutNameReplacement(feeReplacementId, name);

        const query = {
            text: `UPDATE fee_replacements SET name = $2, price = $3, updated_at = $4
                WHERE fee_replacement_id = $1`,
            values: [feeReplacementId, name, price, new Date()]
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) throw new NotFoundError('Gagal update fee replcement, fee replacement tidak ada')
    }

    async checkPutNameReplacement(feeReplacementId, name) {
        const query = {
            text: `SELECT fee_replacement_id
                FROM fee_replacements WHERE fee_replacement_id != $1 and name = $2`,
            values: [feeReplacementId, name]
        };

        const result = await this._pool.query(query);
        if (result.rowCount) throw new InvariantError('Name fee replacement is available')
    }

    async deleteFeeNameReplacement(feeReplacementId) {
        await this.checkFeeReplacementAvailableInProduct(feeReplacementId);

        const query = {
            text: `DELETE FROM fee_replacements WHERE fee_replacement_id = $1`,
            values: [feeReplacementId]
        };

        await this._pool.query(query);
    }

    async checkFeeReplacementAvailableInProduct(feeReplacementId) {
        const query = {
            text: `SELECT product_id
                FROM products WHERE fee_replacement_id = $1`,
            values: [feeReplacementId]
        };

        const result = await this._pool.query(query);
        if (result.rowCount) throw new InvariantError('Fee replacement is available in product')
    }
}

module.exports = FeeReplacementService;
