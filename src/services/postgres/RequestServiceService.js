const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class RequestServiceService {
    constructor({ pool }) {
        this._pool = pool;
    }

    async addRequestService({ userId, device, brand, cracker, servicing, estimationPrice, technicianService }) {
        const id = `request_service-${nanoid(10)}`
        const query = {
            text: `INSERT INTO request_services(request_service_id,
                user_id, device, brand, cracker, servicing, estimation_price, technician_service)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING request_service_id`,
            values: [id, userId, device, brand, cracker, servicing, estimationPrice, technicianService]
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) throw new InvariantError('Gagal insert request service')

        return result.rows[0].request_service_id;
    }

    async addTrackHistoryService({ requestServiceId, status, credentialUserId }) {
        const query = {
            text: `INSERT INTO track_history_services(request_service_id, status,
                created_user_id) VALUES($1, $2, $3) RETURNING request_service_id`,
            values: [requestServiceId, status, credentialUserId]
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) throw new InvariantError('Gagal insert request service')
    }

    async getCountRequestService(search) {
        search = search ? `%${search.toLowerCase()}%` : '%%';
        const query = {
            text: `SELECT count(*) AS count FROM request_services WHERE LOWER(cracker) LIKE $1`,
            values: [search]
        };

        const result = await this._pool.query(query);

        return result.rows[0].count;
    }

    async getRequestServices({ search, limit, offset }) {
        search = search ? `%${search.toLowerCase()}%` : '%%';
        const query = {
            text: `SELECT request_services.*,
            users.fullname
            FROM request_services
            JOIN users ON request_services.user_id = users.user_id 
            WHERE LOWER(cracker) LIKE $3
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2`,
            values: [limit, offset, search],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async getRequestServiceById(serviceId) {
        const query = {
            text: `SELECT *, users.fullname, users.email, users.no_handphone, 
                users.address FROM request_services
                JOIN users ON users.user_id = request_services.user_id
                WHERE request_service_id = $1`,
            values: [serviceId]
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) throw new NotFoundError('Request service tidak ditemukan')

        return result.rows[0];
    }

    async getRequestServiceByIdAndUserId(serviceId, userId) {
        const query = {
            text: `SELECT * FROM request_services WHERE request_service_id = $1 AND user_id = $2`,
            values: [serviceId, userId]
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) throw new NotFoundError('Request service tidak ditemukan')

        return result.rows[0];
    }

    async getTrackHistoryService(serviceId) {
        const query = {
            text: `SELECT * FROM track_history_services WHERE request_service_id = $1
                ORDER BY created_at DESC`,
            values: [serviceId]
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) throw new NotFoundError('Track history service tidak ditemukan')

        return result.rows;
    }

    async updateStatusRequestServiceById({ requestServiceId, status, credentialUserId }) {
        const date = new Date();

        const query = {
            text: `UPDATE request_services SET status = $1, updated_at = $2
                WHERE request_service_id = $3`,
            values: [status, date, requestServiceId]
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) throw new NotFoundError('Gagal update status request service, request service tidak ada');

        await this.addTrackHistoryService({ requestServiceId, status, credentialUserId });
    }
}

module.exports = RequestServiceService;