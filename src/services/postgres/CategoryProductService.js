const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");

class CategoryProductService {
  constructor({ pool }) {
    this._pool = pool;
  }

  async addCategoryProduct({ parentId, name }) {
    await this.checkAddCategoryProductName(name);

    const id = `category_product-${nanoid(10)}`;
    parentId = parentId || "";
    const query = {
      text:
        "INSERT INTO categories_product VALUES($1, $2, $3) RETURNING category_product_id",
      values: [id, parentId, name],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount)
      throw new InvariantError("Gagal menambahkan category product");

    return result.rows[0].category_product_id;
  }

  async checkAddCategoryProductName(name) {
    const query = {
      text: "SELECT * FROM categories_product WHERE name = $1",
      values: [name],
    };

    const result = await this._pool.query(query);
    if (result.rowCount)
      throw new InvariantError("Name category prodcut is available");
  }

  async getCategories() {
    const query = {
      text: "SELECT * FROM categories_product",
    };

    const result = await this._pool.query(query);
    return result;
  }

  async getCategoriesParent() {
    const query = {
      text: "SELECT * FROM categories_product WHERE parent_id = null",
    };

    const result = await this._pool.query(query);
    return result;
  }

  async getCategoriesChildById(id) {
    const query = {
      text: "SELECT * FROM categories_product WHERE parent_id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    return result;
  }
}

module.exports = CategoryProductService;
