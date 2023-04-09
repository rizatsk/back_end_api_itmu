class CategoryProductTestHelper {
  constructor(pool_test) {
    this._pool = pool_test;
  }

  async deleteCategoriesProduct() {
    const query = {
      text: "DELETE FROM categories_product",
    };

    await this._pool.query(query);
  }
}

module.exports = CategoryProductTestHelper;
