const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { stat } = require("fs-extra");

class RequestServiceService {
    constructor({ pool }) {
        this._pool = pool;
    }

    async getProductServicesForRequestService() {
        const query = {
            text: `SELECT product_service_id,
                name, service, price
                FROM product_services`,
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async addRequestService({ userId, device, brand, cracker, servicing, estimationPrice }) {
        const id = `request_service-${nanoid(10)}`
        const query = {
            text: `INSERT INTO request_services(request_service_id,
                user_id, device, brand, cracker, servicing, estimation_price)
                VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING request_service_id`,
            values: [id, userId, device, brand, cracker, servicing, estimationPrice]
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

    async getCountRequestServiceForUser(userId, status) {
        let query = {
            text: `SELECT count(*) AS count FROM request_services 
                WHERE user_id = $1`,
            values: [userId]
        };

        if (status) query = {
            text: `SELECT count(*) AS count FROM request_services 
                WHERE user_id = $1 AND status = $2`,
            values: [userId, status]
        };

        const result = await this._pool.query(query);

        return result.rows[0].count;

    }

    async getRequestServicesForUser({ status, limit, offset, userId }) {
        let query = {
            text: `SELECT request_service_id,
                device, brand, cracker,
                status, updated_at
                FROM request_services
                WHERE user_id = $1
                ORDER BY updated_at DESC
                LIMIT $2 OFFSET $3`,
            values: [userId, limit, offset],
        };

        if (status) query = {
            text: `SELECT request_service_id,
                device, brand, cracker,
                status, updated_at
                FROM request_services
                WHERE user_id = $1 AND status = $4
                ORDER BY updated_at DESC
                LIMIT $2 OFFSET $3`,
            values: [userId, limit, offset, status],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async getCountRequestService(search) {
        search = search ? `%${search.toLowerCase()}%` : '%%';
        const query = {
            text: `SELECT count(*) AS count FROM request_services WHERE LOWER(email) ILIKE $1`,
            values: [search]
        };

        const result = await this._pool.query(query);

        return result.rows[0].count;
    }

    async getRequestServices({ search, limit, offset }) {
        search = search ? `%${search.toLowerCase()}%` : '%%';
        const query = {
            text: `SELECT request_services.request_service_id,
                request_services.device,
                request_services.brand,
                request_services.cracker,
                request_services.servicing,
                request_services.estimation_price,
                request_services.real_price,
                request_services.created_at,
                request_services.updated_at,
                request_services.status,
                users.fullname,
                users.email
                FROM request_services
                JOIN users ON request_services.user_id = users.user_id 
                WHERE LOWER(email) ILIKE $3
                ORDER BY request_services.created_at DESC
                LIMIT $1 OFFSET $2`,
            values: [limit, offset, search],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async getRequestServiceById(serviceId) {
        const query = {
            text: `SELECT request_services.request_service_id,
                request_services.device,
                request_services.brand,
                request_services.cracker,
                request_services.servicing,
                request_services.estimation_price,
                request_services.real_price,
                request_services.status, 
                users.fullname, users.email, users.no_handphone, 
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
            text: `SELECT status, created_at FROM track_history_services WHERE request_service_id = $1
                ORDER BY created_at DESC`,
            values: [serviceId]
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) throw new NotFoundError('Track history service tidak ditemukan')

        return result.rows;
    }

    async getTrackHistoryServiceForCms(serviceId) {
        const query = {
            text: `SELECT track_history_services.status, 
                track_history_services.created_at, 
                user_admins.username 
                FROM track_history_services
                JOIN user_admins ON
                track_history_services.created_user_id = user_admins.admin_id
                WHERE request_service_id = $1
                ORDER BY created_at DESC`,
            values: [serviceId]
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) throw new NotFoundError('Track history service tidak ditemukan')

        return result.rows;
    }

    async updateStatusAndRealPriceRequestServiceById({ requestServiceId, status, realPrice, credentialUserId }) {
        const date = new Date();

        const query = {
            text: `UPDATE request_services SET status = $1, real_price = $2, updated_at = $3
                WHERE request_service_id = $4`,
            values: [status, realPrice, date, requestServiceId]
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) throw new NotFoundError('Gagal update status request service, request service tidak ada');

        await this.addTrackHistoryService({ requestServiceId, status, credentialUserId });
    }
}

module.exports = RequestServiceService;