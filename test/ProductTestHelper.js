const path = require("path");
const fs = require("fs-extra");
const { nanoid } = require("nanoid");

class ProductTestHelper {
  constructor(pool_test) {
    this._pool = pool_test;
  }

  async addProduct({ name, price, typeProduct, description }) {
    const status = "true";
    const id = `product-${nanoid(8)}`;
    const date = new Date();
    const credentialUserId = "admin-00000001";

    const query = {
      text: `INSERT INTO products(product_id, name, price, type_product, 
        created, createdby_user_id, updated, updatedby_user_id, deskripsi_product, status)
        VALUES($1, $2, $3, $4, $5, $6, $5, $6, $7, $8) RETURNING product_id`,
      values: [
        id,
        name,
        price,
        typeProduct,
        date,
        credentialUserId,
        description,
        status,
      ],
    };

    await this._pool.query(query);
    return id;
  }

  async deleteProductById(id) {
    const query = {
      text: "DELETE FROM products WHERE product_id = $1",
      values: [id],
    };

    await this._pool.query(query);
  }

  async deleteProduct() {
    const query = {
      text: "DELETE FROM products",
    };

    await this._pool.query(query);
  }

  deleteImageProduct() {
    const pathLink = path.resolve("./src/public/images/products");
    fs.remove(pathLink);
  }
}

module.exports = ProductTestHelper;
