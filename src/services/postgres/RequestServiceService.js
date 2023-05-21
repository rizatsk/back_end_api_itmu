const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { stat } = require("fs-extra");
const { MappingGetUserByServiceId } = require("../../utils/MappingResultDB");
const StringToLikeSearch = require("../../utils/StringToLikeSearch");

class RequestServiceService {
    constructor({ pool }) {
        this._pool = pool;
    }

    async getSetupServicesForRequestService() {
        const query = {
            text: `SELECT setup_service_id,
                name, type, price
                FROM setup_services`,
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async getProductForRequestService({ device, brand, type }) {
        const deviceBrandGeneral = ["cpu", "ram", "storage", "vga"];
        type = type.toLowerCase();

        const name = deviceBrandGeneral.includes(type) ? StringToLikeSearch(device) : StringToLikeSearch(`${device} ${brand}`);
        let query;

        if (type == 'multiple') {
            const whereTypeProduct = `(${deviceBrandGeneral.map(item => `'${item}'`).join(', ')})`;
            query = {
                text: `SELECT product_id,
                    name, price
                    FROM products
                    WHERE status = true AND sparepart = true
                    AND name ILIKE $1
                    UNION
                    SELECT product_id,
                    name, price
                    FROM products
                    WHERE status = true AND sparepart = true
                    AND name ILIKE $2 AND LOWER(type_product) IN ${whereTypeProduct}`,
                values: [name, StringToLikeSearch(device)]
            };
        } else {
            query = {
                text: `SELECT product_id,
                name, price
                FROM products
                WHERE status = true AND sparepart = true
                AND name ILIKE $1 AND LOWER(type_product) = $2`,
                values: [name, type]
            };
        }

        const result = await this._pool.query(query);

        return result.rows;
    }

    async addRequestService({ userId, device, brand, cracker, servicing, estimationPrice, product, description }) {
        const id = `request_service-${nanoid(10)}`
        description = description || null;

        const query = {
            text: `INSERT INTO request_services(request_service_id,
                user_id, device, brand, cracker, servicing, estimation_price, product, description)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING request_service_id`,
            values: [id, userId, device, brand, cracker, servicing, estimationPrice, product, description]
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) throw new InvariantError('Gagal insert request service')

        return result.rows[0].request_service_id;
    }

    async checkProductId(productId) {
        const query = {
            text: `SELECT product_id, sparepart FROM products WHERE product_id = $1 `,
            values: [productId]
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) throw new NotFoundError('Product tidak tersedia')
        if (!result.rows[0].sparepart) throw new InvariantError('Product bukan bertype sparepart');
    };

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
            text: `SELECT count(*) AS count FROM request_services 
                JOIN users ON request_services.user_id = users.user_id 
                WHERE LOWER(email) ILIKE $1`,
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
                request_services.product,
                request_services.description,
                users.fullname, users.email, users.no_handphone, 
                users.address FROM request_services
                JOIN users ON users.user_id = request_services.user_id
                WHERE request_service_id = $1`,
            values: [serviceId]
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) throw new NotFoundError('Request service tidak ditemukan')
        if (result.rows[0].product.length > 0) {
            const products = result.rows[0].product
            const whereProductId = `(${products.map(item => `'${item}'`).join(', ')})`;

            const query = {
                text: `SELECT name, price FROM products WHERE product_id IN ${whereProductId}`,
            };

            const resultProducts = await this._pool.query(query);
            result.rows[0].product = resultProducts.rows;
        }

        return result.rows[0];
    }

    async getRequestServiceByIdAndUserId(serviceId, userId) {
        const query = {
            text: `SELECT * FROM request_services WHERE request_service_id = $1 AND user_id = $2`,
            values: [serviceId, userId]
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) throw new NotFoundError('Request service tidak ditemukan')
        if (result.rows[0].product.length > 0) {
            const products = result.rows[0].product
            const whereProductId = `(${products.map(item => `'${item}'`).join(', ')})`;

            const query = {
                text: `SELECT name, price FROM products WHERE product_id IN ${whereProductId}`
            };

            const resultProducts = await this._pool.query(query);
            result.rows[0].product = resultProducts.rows;
        }

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

    async getUserByRequestServiceId(serviceId) {
        const query = {
            text:
                `SELECT email, fullname, device, brand, cracker,
                request_services.status, estimation_price, real_price, servicing
                FROM request_services 
                JOIN users
                ON users.user_id = request_services.user_id
                WHERE request_service_id = $1`,
            values: [serviceId],
        };

        const result = await this._pool.query(query);
        if (result.rowCount < 1) throw new NotFoundError("User tidak ditemukan");

        const data = result.rows.map(MappingGetUserByServiceId);
        return data[0];
    }
}

module.exports = RequestServiceService;