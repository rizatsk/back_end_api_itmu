const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");

class CategoriesProductService {
  constructor({ pool }) {
    this._pool = pool;
  }

  async addCategoriesProduct({ parentId, name }) {
    const id = `category_product-${nanoid(10)}`;
    parentId = parentId || "";
    const query = {
      text:
        "INSERT INTO categories_product VALUES($1, $2, $3) RETURNING categorie_product_id",
      values: [id, parentId, name],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new InvariantError("Gagal menambahkan product");

    return result.rows[0].categorie_product_id;
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

module.exports = CategoriesProductService;
