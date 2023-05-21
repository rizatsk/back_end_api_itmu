const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class SetupServiceService {
    constructor({ pool }) {
        this._pool = pool;
    }

    async addSetupService({ name, detail, price, type }) {
        await this.checkAddNameAndType(name, type);

        const id = `setup_service-${nanoid(10)}`
        const query = {
            text: `INSERT INTO setup_services(setup_service_id,
                name, detail, price, type)
                VALUES($1, $2, $3, $4, $5) RETURNING setup_service_id`,
            values: [id, name, detail, price, type]
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) throw new InvariantError('Fail insert setup service')

        return result.rows[0].setup_service_id;
    }

    async checkAddNameAndType(name, type) {
        const query = {
            text: 'SELECT setup_service_id FROM setup_services WHERE name = $1 AND type = $2',
            values: [name, type]
        };

        const result = await this._pool.query(query);
        if (result.rowCount) throw new InvariantError('Name and type setup is available')
    }

    async getCountSetupServices(search) {
        search = search ? `%${search}%` : '%%';
        const query = {
            text: `SELECT count(*) AS count FROM setup_services WHERE name ILIKE $1`,
            values: [search]
        };

        const result = await this._pool.query(query);

        return result.rows[0].count;
    }

    async getSetupServices({ search, limit, offset }) {
        search = search ? `%${search}%` : '%%';
        const query = {
            text: `SELECT *
                FROM setup_services
                WHERE name ILIKE $3
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2`,
            values: [limit, offset, search],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async getSetupServiceById(id) {
        const query = {
            text: `SELECT setup_service_id,
                name, detail, price, type
                FROM setup_services WHERE setup_service_id = $1`,
            values: [id]
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) throw new NotFoundError('Setup service tidak ditemukan')

        return result.rows[0];
    }

    async putSetupServiceById({ setupServiceId, name, detail, price, type }) {
        await this.checkPutNameAndService(setupServiceId, name, type);

        const query = {
            text: `UPDATE setup_services SET name = $2, detail = $3, 
                price = $4, type = $5, updated_at = $6
                WHERE setup_service_id = $1`,
            values: [setupServiceId, name, detail, price, type, new Date()]
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) throw new NotFoundError('Gagal update setup service, setup service tidak ada')
    }

    async checkPutNameAndService(setupServiceId, name, type) {
        const query = {
            text: `SELECT setup_service_id
                FROM setup_services WHERE setup_service_id != $1 AND name = $2 AND type = $3`,
            values: [setupServiceId, name, type]
        };

        const result = await this._pool.query(query);
        if (result.rowCount) throw new InvariantError('Name and type is available')
    }

    async deleteSetupServiceById(setupServiceId) {
        const query = {
            text: `DELETE FROM setup_services WHERE setup_service_id = $1`,
            values: [setupServiceId]
        };

        await this._pool.query(query);
    }
}

module.exports = SetupServiceService;
