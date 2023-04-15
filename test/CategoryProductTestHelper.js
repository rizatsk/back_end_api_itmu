const { nanoid } = require("nanoid");

class CategoryProductTestHelper {
  constructor(pool_test) {
    this._pool = pool_test;
  }

  async addCategoryProduct({ parentId, name }) {
    const id = `category_product-${nanoid(10)}`;
    parentId = parentId || "";
    const query = {
      text:
        "INSERT INTO categories_product VALUES($1, $2, $3) RETURNING category_product_id",
      values: [id, parentId, name],
    };

    const result = await this._pool.query(query);
    return result.rows[0].category_product_id;
  }

  async deleteCategoriesProduct() {
    const query = {
      text: "DELETE FROM categories_product",
    };

    await this._pool.query(query);
  }
}

module.exports = CategoryProductTestHelper;
