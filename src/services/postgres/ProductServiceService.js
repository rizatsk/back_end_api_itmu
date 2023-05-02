const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class ProductServiceService {
    constructor({ pool }) {
        this._pool = pool;
    }

    async addProductService({ name, service, price }) {
        await this.checkAddNameAndServiceProductService(name, service);

        const id = `product_service-${nanoid(10)}`
        const query = {
            text: `INSERT INTO product_services(product_service_id,
                name, service, price)
                VALUES($1, $2, $3, $4) RETURNING product_service_id`,
            values: [id, name, service, price]
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) throw new InvariantError('Gagal insert fee replacement')

        return result.rows[0].product_service_id;
    }

    async checkAddNameAndServiceProductService(name, service) {
        const query = {
            text: 'SELECT product_service_id FROM product_services WHERE name = $1 AND service = $2',
            values: [name, service]
        };

        const result = await this._pool.query(query);
        if (result.rowCount) throw new InvariantError('Name and service product is available')
    }

    async getCountProductServices(search) {
        search = search ? `%${search}%` : '%%';
        const query = {
            text: `SELECT count(*) AS product_services FROM fee_replacements WHERE name ILIKE $1`,
            values: [search]
        };

        const result = await this._pool.query(query);

        return result.rows[0].count;
    }

    async getProductServices({ search, limit, offset }) {
        search = search ? `%${search}%` : '%%';
        const query = {
            text: `SELECT *
                FROM product_services
                WHERE name ILIKE $3
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2`,
            values: [limit, offset, search],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async getProductServicesForRequestService(id) {
        const query = {
            text: `SELECT product_service_id,
                name, service, price
                FROM product_services`,
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async getProductServiceById(id) {
        const query = {
            text: `SELECT product_service_id,
                name, service, price
                FROM product_services WHERE product_service_id = $1`,
            values: [id]
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) throw new NotFoundError('Product service tidak ditemukan')

        return result.rows[0];
    }

    async putProductServiceById({ productServiceId, name, service, price }) {
        await this.checkPutNameAndService(productServiceId, name, service);

        const query = {
            text: `UPDATE product_services SET name = $2, service = $3, price = $4, updated_at = $5
                WHERE product_service_id = $1`,
            values: [productServiceId, name, service, price, new Date()]
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) throw new NotFoundError('Gagal update product service, product service tidak ada')
    }

    async checkPutNameAndService(productServiceId, name, service) {
        const query = {
            text: `SELECT product_service_id
                FROM product_services WHERE product_service_id != $1 AND name = $2 AND service = $3`,
            values: [productServiceId, name, service]
        };

        const result = await this._pool.query(query);
        if (result.rowCount) throw new InvariantError('Name and service product is available')
    }

    async deleteProductServiceById(productServiceId) {
        const query = {
            text: `DELETE FROM product_services WHERE product_service_id = $1`,
            values: [productServiceId]
        };

        await this._pool.query(query);
    }
}

module.exports = ProductServiceService;
