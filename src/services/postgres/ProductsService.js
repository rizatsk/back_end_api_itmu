const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { MappingPricePromotionProductById, MappingProducts, MappingProductsForUser } = require("../../utils/MappingResultDB");
const StringToLikeSearch = require("../../utils/StringToLikeSearch");

class ProductsService {
  constructor({ pool }) {
    this._pool = pool;
  }

  async checkNameProduct(name) {
    const query = {
      text: `SELECT product_id FROM products WHERE name = $1`,
      values: [name],
    };

    const result = await this._pool.query(query);

    if (result.rowCount) {
      throw new InvariantError("Nama product sudah ada");
    }
  }

  async addProduct({
    credentialUserId,
    name,
    price,
    typeProduct,
    description,
    categoryId,
    sale,
    sparepart,
    feeReplacementId,
  }) {
    const status = "true";
    const id = `product-${nanoid(8)}`;
    const date = new Date();
    const feeReplacementData = sparepart ? feeReplacementId : null;
    if (feeReplacementData) await this.checkFeeReplacement(feeReplacementData);

    const query = {
      text: `INSERT INTO products(product_id, name, price, type_product, 
        created, createdby_user_id, updated, updatedby_user_id, deskripsi_product, status, category_id, sale, sparepart, fee_replacement_id)
        VALUES($1, $2, $3, $4, $5, $6, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING product_id`,
      values: [
        id,
        name,
        price,
        typeProduct,
        date,
        credentialUserId,
        description,
        status,
        categoryId,
        sale,
        sparepart,
        feeReplacementData,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError("Gagal menambahkan product");

    return result.rows[0].product_id;
  }

  async checkFeeReplacement(feeReplacement) {
    const query = {
      text: 'SELECT fee_replacement_id FROM fee_replacements WHERE fee_replacement_id = $1',
      values: [feeReplacement]
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Fee replacement is not found')
  }

  async getCountProductsSearch(search_query) {
    search_query = search_query ? `%${search_query.toLowerCase()}%` : '%%';
    const query = {
      text: `SELECT count(*) AS count FROM products WHERE LOWER(name) LIKE $1`,
      values: [search_query]
    };

    const result = await this._pool.query(query);

    return result.rows[0].count;
  }

  async getProductsSearch({ search, limit, offset }) {
    search = search ? `%${search}%` : '%%';
    const query = {
      text: `SELECT product_id, name, price, created, status,
        price_promotion, sale, sparepart
        FROM products 
        WHERE LOWER(name) ILIKE $3
        ORDER BY created
        LIMIT $1 OFFSET $2`,
      values: [limit, offset, search],
    };

    const result = await this._pool.query(query);
    const data = result.rows.map(MappingProducts);

    return data;
  }

  async getProductsById(productId) {
    const query = {
      text: `SELECT products.product_id,
        products.name,
        products.price,
        type_product,
        deskripsi_product,
        category_id,
        price_promotion,
        sparepart,
        fee_replacements.fee_replacement_id,
        fee_replacements.name AS fee_replacement_name,
        fee_replacements.price AS fee_replacement_price
        FROM products 
        LEFT JOIN fee_replacements ON 
        fee_replacements.fee_replacement_id = products.fee_replacement_id
        WHERE product_id = $1`,
      values: [productId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new NotFoundError("Product tidak ditemukan");

    return result.rows[0];
  }

  async checkNameProductForUpdate(name, productId) {
    const query = {
      text:
        "SELECT product_id FROM products WHERE name = $1 AND product_id != $2",
      values: [name, productId],
    };

    const result = await this._pool.query(query);
    if (result.rowCount) {
      throw new InvariantError("Nama product tersedia");
    }
  }

  async editProductsById({
    credentialUserId,
    productId,
    name,
    price,
    typeProduct,
    description,
    categoryId,
    sparepart,
    feeReplacementId,
  }) {
    await this.checkNameProductForUpdate(name, productId);
    const feeReplacementData = sparepart ? feeReplacementId : null;
    if (feeReplacementData) await this.checkFeeReplacement(feeReplacementData);

    const date = new Date();
    const query = {
      text: `UPDATE products SET name = $1, price = $2, type_product = $3,
        updated = $4, updatedby_user_id = $5, deskripsi_product = $7, category_id = $8, sparepart = $9, fee_replacement_id = $10 WHERE product_id = $6`,
      values: [
        name,
        price,
        typeProduct,
        date,
        credentialUserId,
        productId,
        description,
        categoryId,
        sparepart,
        feeReplacementData,
      ],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount)
      throw new NotFoundError("Gagal edit product, product id tidak ditemukan");
  }

  async editStatusProductsById({ productId, status, credentialUserId }) {
    const date = new Date();
    const query = {
      text: `UPDATE products SET status = $1, updated = $3, updatedby_user_id = $4 WHERE product_id = $2`,
      values: [status, productId, date, credentialUserId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount)
      throw new InvariantError(
        "Gagal edit status product, product id tidak ditemukan"
      );
  }

  async editSaleProductById({ productId, sale, credentialUserId }) {
    const date = new Date();
    const query = {
      text: `UPDATE products SET sale = $1, updated = $3, updatedby_user_id = $4 WHERE product_id = $2`,
      values: [sale, productId, date, credentialUserId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount)
      throw new InvariantError(
        "Gagal edit status sale product, product id tidak ditemukan"
      );
  }

  async addImageProduct(productId, imageUrl) {
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
  }

  async getImageProductIdById(productId) {
    const query = {
      text: `SELECT image_product_id AS imageProductId FROM image_products WHERE product_id = $1`,
      values: [productId],
    };

    if (!result.rows) return [];
    const { rows: response } = await this._pool.query(query);
    const result = response.map(({ productId }) => {
      const result = [];
      result.push(productId);
      return result;
    });
    return result;
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
    const query = {
      text: `SELECT link FROM image_products WHERE image_product_id = $1`,
      values: [imageProductId],
    };

    const result = await this._pool.query(query);
    return result.rows[0].link;
  }

  async deleteImageProduct(imageProductId, productId) {
    const query = {
      text: `DELETE FROM image_products WHERE image_product_id = $1 AND product_id = $2`,
      values: [imageProductId, productId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount)
      throw new InvariantError(
        "Gagal menghapus gambar product, product id tidak ditemukan"
      );
  }

  async deleteProductById(productId) {
    const query = {
      text: "DELETE FROM products WHERE product_id = $1",
      values: [productId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError("Product id tidak ditemukan");
  }

  async checkProductByCategoryId(id) {
    const query = {
      text: "SELECT product_id, name FROM products WHERE category_id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (result.rowCount) {
      throw new InvariantError(`Gagal menghapus, product ${result.rows[0].name} menggunakan category ini`);
    }
  }

  async updatePricePromotionProductById({ productId, price, pricePromotion }) {
    pricePromotion = pricePromotion || null;
    const query = {
      text: "UPDATE products SET price = $2, price_promotion = $3 WHERE product_id = $1",
      values: [productId, price, pricePromotion],
    };

    await this._pool.query(query);
  }

  async getCountProducts(search) {
    search = StringToLikeSearch(search);
    const query = {
      text: `SELECT count(*) AS count FROM products WHERE LOWER(name) ILIKE $1 AND status = true`,
      values: [search]
    };

    const result = await this._pool.query(query);

    return result.rows[0].count;
  }

  async getProducts({ search, limit, offset }) {
    search = StringToLikeSearch(search);
    const query = {
      text: `SELECT product_id, name, price, created, status,
        price_promotion, sale, sparepart
        FROM products 
        WHERE LOWER(name) ILIKE $3 AND status = true
        ORDER BY created
        LIMIT $1 OFFSET $2`,
      values: [limit, offset, search],
    };

    const result = await this._pool.query(query);
    const data = result.rows.map(MappingProducts);

    return data;
  }

  async getCountProductsSaleOrService(param) {
    const query = {
      text: `SELECT count(*) AS count FROM products WHERE ${param} = true
        AND status = true`,
    };

    const result = await this._pool.query(query);

    return result.rows[0].count;
  }

  async getProductsSaleOrService({ param, limit, offset }) {
    const query = {
      text: `select products.product_id, 
        name, price, price_promotion,
        (SELECT link FROM image_products WHERE product_id = products.product_id 
        ORDER BY created ASC LIMIT 1) AS image_link 
        FROM products WHERE ${param} = true AND status = true
        ORDER BY created DESC LIMIT $1 OFFSET $2`,
      values: [limit, offset],
    };

    const result = await this._pool.query(query);
    const data = result.rows.map(MappingProductsForUser);
    return data;
  }
}

module.exports = ProductsService;
