const { nanoid } = require("nanoid");

class CategoryProductTestHelper {
  constructor(pool_test) {
    this._pool = pool_test;
  }

  async addCategoryProduct(parentId, name) {
    const id = `category_product-${nanoid(10)}`;
    parentId = parentId || null;
    const query = {
      text:
        `INSERT INTO categories_product(category_product_id,
          parent_id, name, createdby_user_id, updatedby_user_id) 
        VALUES($1, $2, $3, $4, $4) RETURNING category_product_id`,
      values: [id, parentId, name, 'admin-00000001'],
    };

    const result = await this._pool.query(query);
    return result.rows[0].category_product_id;
  }

  async addCategoryChild() {
    const parentId = await this.addCategoryProduct('', 'komputer');
    const childId = await this.addCategoryProduct(parentId, 'RAM');
    return childId;
  }

  async getParentId(id) {
    const query = {
      text: 'SELECT category_product_id FROM categories_product where category_product_id = $1',
      values: [id]
    };

    const result = await this._pool.query(query);
    const parentId = result.rows[0].category_product_id;
    return parentId;
  }

  async deleteCategoriesProduct() {
    const query = {
      text: "DELETE FROM categories_product",
    };

    await this._pool.query(query);
  }
}

module.exports = CategoryProductTestHelper;
