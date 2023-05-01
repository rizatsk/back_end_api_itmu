const { nanoid } = require("nanoid");

class FeeReplacementTestHelper {
    constructor(pool_test) {
        this._pool = pool_test;
    }

    async addFeeReplacement() {
        const name = "replacement storage",
            price = 75000;

        const id = `fee_replacement-${nanoid(10)}`;
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

    async deleteFeeReplacement() {
        const query = {
            text: `DELETE FROM fee_replacements`,
        };

        await this._pool.query(query);
    }

    async addProduct(feeReplacementId, categoryId) {
        const name = 'Storage samsung SSD NVME 500GB',
            price = 1450000,
            typeProduct = 'storage',
            description = 'storage ssd',
            sparepart = true;
        const status = "true";
        const id = `product-${nanoid(8)}`;
        const date = new Date();
        const credentialUserId = "admin-00000001";

        const query = {
            text: `INSERT INTO products(product_id, name, category_id, price, type_product, 
        created, createdby_user_id, updated, updatedby_user_id, deskripsi_product, status, 
        sparepart, fee_replacement_id)
        VALUES($1, $2, $3, $4, $5, $6, $7, $6, $7, $8, $9, $10, $11) RETURNING product_id`,
            values: [
                id,
                name,
                categoryId,
                price,
                typeProduct,
                date,
                credentialUserId,
                description,
                status,
                sparepart,
                feeReplacementId
            ],
        };

        await this._pool.query(query);
        return id;
    }

}

module.exports = FeeReplacementTestHelper;