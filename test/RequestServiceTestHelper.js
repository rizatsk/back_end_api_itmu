const { nanoid } = require("nanoid");

class RequestServiceTestHelper {
    constructor(pool_test) {
        this._pool = pool_test;
    }

    async addRequestService({
        userId,
    }) {
        const device = 'Komputer',
            brand = 'Lenovo',
            cracker = 'Storage Samsung SSD M.2 500GB',
            servicing = 'Pergantian',
            estimationPrice = '1500000',
            technicianService = 'layanan teknisi';
        const id = `request_service-${nanoid(10)}`;

        const query = {
            text: `INSERT INTO request_services(request_service_id,
                user_id, device, brand, cracker, servicing, estimation_price, technician_service)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING request_service_id`,
            values: [id, userId, device, brand, cracker, servicing, estimationPrice, technicianService]
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) throw new InvariantError('Gagal insert request service');

        await this.addTrackHistoryService(result.rows[0].request_service_id);

        return result.rows[0].request_service_id;
    }

    async addTrackHistoryService(requestServiceId) {
        const status = 'waiting confirmation';
        const credentialUserId = 'admin-00000001';

        const query = {
            text: `INSERT INTO track_history_services(request_service_id, status,
                created_user_id) VALUES($1, $2, $3) RETURNING request_service_id`,
            values: [requestServiceId, status, credentialUserId]
        };

        await this._pool.query(query);
    }

    async deleteRequestService() {
        await this._pool.query({ text: 'DELETE FROM track_history_services' })

        const query = {
            text: 'DELETE FROM request_services'
        };

        await this._pool.query(query)

    }
}

module.exports = RequestServiceTestHelper;