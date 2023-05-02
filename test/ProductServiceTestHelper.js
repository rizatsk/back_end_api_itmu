const { nanoid } = require("nanoid");

class ProductServiceTestHelper {
    constructor(pool_test) {
        this._pool = pool_test;
    }

    async addProductService() {
        const name = 'sistem',
            service = 'install ulang os',
            price = 50000;

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

    async deleteProductService() {
        const query = {
            text: 'DELETE FROM product_services'
        };

        await this._pool.query(query);
    }
}

module.exports = ProductServiceTestHelper