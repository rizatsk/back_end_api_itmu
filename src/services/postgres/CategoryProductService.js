const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");

class CategoryProductService {
  constructor({ pool }) {
    this._pool = pool;
  }

  async addCategoryProduct({ parentId, name }) {
    parentId = parentId || "";
    await this.checkAddCategoryProductName(name, parentId);

    const id = `category_product-${nanoid(10)}`;
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

  async checkAddCategoryProductName(name, parentId) {
    const query = {
      text:
        "SELECT * FROM categories_product WHERE name = $1 AND parent_id = $2",
      values: [name, parentId],
    };

    const result = await this._pool.query(query);
    if (result.rowCount)
      throw new InvariantError(
        "Name category with parent id prodcut is available"
      );
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
