const { nanoid } = require("nanoid");
const { MappingProductsTest } = require("../../utils/MappingResultDB");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class ProductTestService {
    constructor({ pool }) {
        this._pool = pool;
    }

    async addProduct({
        name,
        buy_price,
        sale_price,
        stock,
        foto_product,
    }) {
        const id = `product-${nanoid(8)}`;
        const date = new Date();

        const query = {
            text: `INSERT INTO products_test(product_id, name, buy_price, sale_price, stock,
        foto_product, created, updated)
        VALUES($1, $2, $3, $4, $5, $6, $7, $7) RETURNING product_id`,
            values: [
                id,
                name,
                buy_price,
                sale_price,
                stock,
                foto_product,
                date,
            ],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) throw new InvariantError("Failed to add product");

        return result.rows[0].product_id;
    }

    async checkNameProduct(name) {
        const query = {
            text: `SELECT product_id FROM products_test WHERE name = $1`,
            values: [name],
        };

        const result = await this._pool.query(query);

        if (result.rowCount) {
            throw new InvariantError("Name product is available");
        }
    }

    async getCountProductsSearch(search_query) {
        search_query = search_query ? `%${search_query.toLowerCase()}%` : '%%';
        const query = {
            text: `SELECT count(*) AS count FROM products_test WHERE LOWER(name) LIKE $1`,
            values: [search_query]
        };

        const result = await this._pool.query(query);

        return result.rows[0].count;
    }

    async getProductsSearch({ search, limit, offset }) {
        search = search ? `%${search}%` : '%%';
        const query = {
            text: `SELECT product_id, name, 
                buy_price,
                sale_price,
                stock, foto_product,
                created
                FROM products_test 
                WHERE LOWER(name) ILIKE $3
                ORDER BY created
                LIMIT $1 OFFSET $2`,
            values: [limit, offset, search],
        };

        const result = await this._pool.query(query);
        const data = result.rows.map(MappingProductsTest)

        return data;
    }

    async getProductsById(productId) {
        const query = {
            text: `SELECT product_id, name, 
                buy_price,
                sale_price,
                stock,
                foto_product
                FROM products_test
                WHERE product_id = $1`,
            values: [productId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) throw new NotFoundError("Product is not found");

        const data = result.rows.map(MappingProductsTest)
        return data[0];
    }

    async checkNameProductForUpdate(name, productId) {
        const query = {
            text:
                "SELECT product_id FROM products_test WHERE name = $1 AND product_id != $2",
            values: [name, productId],
        };

        const result = await this._pool.query(query);

        if (result.rowCount) {
            throw new InvariantError("Name product is available");
        }
    }

    async editProductsById({
        productId,
        name,
        buy_price,
        sale_price,
        stock,
        foto_product,
    }) {
        const updateProduct = foto_product ? `, foto_product = '${foto_product}'` : '';
        const date = new Date();

        const query = {
            text: `UPDATE products_test SET name = $1, buy_price = $2, sale_price = $3,
        stock = $4, updated = $5 ${updateProduct} WHERE product_id = $6`,
            values: [
                name,
                buy_price,
                sale_price,
                stock,
                date,
                productId,
            ],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount)
            throw new NotFoundError("Fail update product, product is not found");
    }

    async deleteProductById(productId) {
        const query = {
            text:
                "DELETE FROM products_test WHERE product_id = $1",
            values: [productId],
        };

        await this._pool.query(query);
    }

    async getFotoProductById(productId) {
        const query = {
            text:
                "SELECT product_id, foto_product FROM products_test WHERE product_id = $1",
            values: [productId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) throw new NotFoundError("Product is not found");

        return result.rows[0].foto_product;
    }
}

module.exports = ProductTestService;