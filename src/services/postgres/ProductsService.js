const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const getDateTime = require("../../utils/getDateTime");
const InvariantError = require("../../exceptions/InvariantError");

class ProductsService {
  constructor() {
    this._pool = new Pool();
  }

  async checkNameProduct(name) {
    const query = {
      text: `SELECT product_id FROM products WHERE name = $1`,
      values: [name],
    };

    const result = await this._pool.query(query);

    if (result.rowCount) {
      throw new InvariantError("Nama product sudah ada.");
    }
  }

  async addProduct({ credentialUserId, name, price, typeProduct }) {
    const status = "true";
    const id = `product-${nanoid(8)}`;

    const query = {
      text: `INSERT INTO products(product_id, name, price, type_product, 
        created, createdby_user_id, updated, updatedby_user_id, status)
        VALUES($1, $2, $3, $4, $5, $6, $5, $6, $7) RETURNING product_id`,
      values: [
        id,
        name,
        price,
        typeProduct,
        getDateTime(),
        credentialUserId,
        status,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError("Gagal menambahkan product");

    return result.rows[0].product_id;
  }

  async getProductsSearch({ search_query, limit, offset }) {
    const query = {
      text: `SELECT product_id, name, price, created, status
        FROM products 
        WHERE name LIKE '%${search_query}%'
        LIMIT $1 OFFSET $2`,
      values: [limit, offset],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getCountProductsSearch(search_query) {
    const query = {
      text: `SELECT count(*) AS count FROM products WHERE name LIKE '%${search_query}%'`,
    };

    const result = await this._pool.query(query);

    return result.rows[0].count;
  }

  async getProductsById(productId) {
    const query = {
      text: "SELECT * FROM products WHERE product_id = $1",
      values: [productId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError("Product tidak ditemukan");

    return result.rows[0];
  }

  async editProductsById({
    credentialUserId,
    productId,
    name,
    price,
    typeProduct,
  }) {
    const query = {
      text: `UPDATE products SET name = $1, price = $2, type_product = $3,
        updated = $4, updatedby_user_id = $5 WHERE product_id = $6`,
      values: [
        name,
        price,
        typeProduct,
        getDateTime(),
        credentialUserId,
        productId,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount)
      throw new InvariantError(
        "Gagal edit product, product id tidak ditemukan"
      );
  }

  async editStatusProductsById({ productId, status, credentialUserId }) {
    const query = {
      text: `UPDATE products SET status = $1, updated = $3, updatedby_user_id = $4 WHERE product_id = $2`,
      values: [status, productId, getDateTime(), credentialUserId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount)
      throw new InvariantError(
        "Gagal edit status product, product id tidak ditemukan"
      );
  }

  async addImageProduct(productId, imageUrl) {
    try {
      const id = `image-product-${nanoid(16)}`;
      const query = {
        text: `INSERT INTO image_products(image_product_id, product_id, link) VALUES($1, $2, $3) RETURNING image_product_id`,
        values: [id, productId, imageUrl],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount)
        throw new InvariantError(
          "Gagal upload image product, product id tidak ditemukan"
        );

      return result.rows[0].id;
    } catch (error) {
      console.log(error);
    }
  }

  async getImageProducts(productId) {
    const query = {
      text: `SELECT image_product_id AS imageProductId, link FROM image_products WHERE product_id = $1`,
      values: [productId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getImageProductsName(imageProductId) {
    imageProductId = imageProductId.replace("[", "");
    imageProductId = imageProductId.replace("]", "");
    imageProductId = imageProductId.split(",");
    imageProductId = imageProductId.join(",");

    const query = {
      text: `SELECT link FROM image_products WHERE image_product_id IN (${imageProductId})`,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteImageProduct(imageProductId, productId) {
    imageProductId = imageProductId.replace("[", "");
    imageProductId = imageProductId.replace("]", "");
    imageProductId = imageProductId.split(",");
    imageProductId = imageProductId.join(",");

    const query = {
      text: `DELETE FROM image_products WHERE image_product_id IN (${imageProductId}) AND product_id = $1`,
      values: [productId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount)
      throw new InvariantError(
        "Gagal menghapus gambar product, product id tidak ditemukan"
      );
  }
}

module.exports = ProductsService;
