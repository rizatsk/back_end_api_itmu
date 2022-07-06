const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const getDateTime = require('../../utils/getDateTime');
const InvariantError = require('../../exceptions/InvariantError');

class ProductsService {
  constructor() {
    this._pool = new Pool();
  }

  async addProduct({credentialUserId, name, price, typeProduct}) {
    const status = 'true';
    const id = `product-${nanoid(8)}`;

    const query = {
      text: `INSERT INTO products(product_id, name, price, type_product, 
        created, createdby_user_id, updated, updatedby_user_id, status)
        VALUES($1, $2, $3, $4, $5, $6, $5, $6, $7) RETURNING product_id`,
      values: [id, name, price, typeProduct, getDateTime(), credentialUserId,
        status],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Gagal menambahkan product');

    return result.rows[0].product_id;
  }

  async getProducts() {
    const query = {
      text: 'SELECT product_id, name, price, image, created, status FROM products',
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getProductsById(productId) {
    const query = {
      text: 'SELECT * FROM products WHERE product_id = $1',
      values: [productId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Product tidak ditemukan');

    return result.rows[0];
  }

  async editProductsById({credentialUserId, productId, name, price, typeProduct}) {
    const query = {
      text: `UPDATE products SET name = $1, price = $2, type_product = $3,
        updated = $4, updatedby_user_id = $5 WHERE product_id = $6`,
      values: [name, price, typeProduct, getDateTime(), credentialUserId, productId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Gagal edit product, product id tidak ditemukan');
  }

  async editStatusProductsById({credentialUserId, productId, status}) {
    const query = {
      text: `UPDATE products SET status = $1,
        updated = $2, updatedby_user_id = $3 WHERE product_id = $4`,
      values: [status, getDateTime(), credentialUserId, productId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Gagal edit status product, product id tidak ditemukan');
  }

  async addImageProduct({credentialUserId, productId, imageUrl}) {
    const images = [];
    images.push(imageUrl);

    const query = {
      text: `UPDATE products SET image = $1::text[],
        updated = $2, updatedby_user_id = $3 WHERE product_id = $4`,
      values: [images, getDateTime(), credentialUserId, productId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Gagal upload image product, product id tidak ditemukan');
  }

  async checkProductId(productId) {
    const query = {
      text: 'SELECT product_id, image[1] FROM products WHERE product_id = $1',
      values: [productId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Gagal upload image product, product id tidak ditemukan');

    const {image} = result.rows[0];
    if (image != null) {
      const fileName = image.split('/');
      const previousFilename = fileName[fileName.length -1];
      return previousFilename;
    } else {
      return null;
    }
  }

  async deleteImageProduct(credentialUserId, productId) {
    const query = {
      text: `UPDATE products SET image = null, updated = $2, updatedby_user_id = $3 
        WHERE product_id = $1`,
      values: [productId, getDateTime(), credentialUserId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Gagal menghapus gambar product, product id tidak ditemukan');
  }
}

module.exports = ProductsService;
