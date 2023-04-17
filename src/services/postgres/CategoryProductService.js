const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const { MappingCategoriesProduct, mappedDataCategories } = require("../../utils/MappingResultDB");

class CategoryProductService {
  constructor({ pool }) {
    this._pool = pool;
  }

  async addCategoryProduct({ parentId, name, credentialUserId }) {
    parentId = parentId || null;
    await this.checkAddCategoryProductName(name, parentId);

    const id = `category_product-${nanoid(10)}`;
    const query = {
      text: `INSERT INTO categories_product(category_product_id, parent_id, name, createdby_user_id, updatedby_user_id) 
        VALUES($1, $2, $3, $4, $4) RETURNING category_product_id`,
      values: [id, parentId, name, credentialUserId],
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

  async getCountCategories() {
    const query = {
      text: "SELECT count(*) AS count FROM categories_product",
    };

    const result = await this._pool.query(query);
    return result.rows[0].count;
  }

  async getCategories({ limit, offset }) {
    const query = {
      text: `SELECT * FROM categories_product ORDER BY created LIMIT $1 OFFSET $2`,
      values: [limit, offset],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getCategoriesIdAndName() {
    const query = {
      text:
        "SELECT category_product_id, parent_id, name FROM categories_product",
    };

    const result = await this._pool.query(query);
    const categories = result.rows;
    for (let i = 0; i < categories.length; i++) {
      categories[i].parentName = await this.getCategoriesParentHandler(
        categories[i].parent_id,
        categories[i].name
      ); // Menambahkan 3 ke nilai kolom 'age'
    }

    let data = categories.map(MappingCategoriesProduct);
    data.sort(function (a, b) {
      return a.parentName.localeCompare(b.parentName);
    });
    return data;
  }

  async getCategoriesParentHandler(parentId, name) {
    // let { parentId, name } = request.query;
    if (parentId == null) return name;

    let parent = await this.getCategoryByParentId(parentId);
    name = `${parent.name} > ${name}`;
    if (parent.parent_id == null) return name;

    return await this.getCategoriesParentHandler(parent.parent_id, name);
  }

  async getCategoryByParentId(id) {
    const query = {
      text:
        "SELECT parent_id, name FROM categories_product WHERE category_product_id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) return 0;

    return result.rows[0];
  }

  async getCategoriesTree() {
    const query = {
      text:
        "SELECT category_product_id, parent_id, name FROM categories_product",
    };

    const result = await this._pool.query(query);
    const data = result.rows;
    const categories = mappedDataCategories(data, null)

    return categories;
  }
}

module.exports = CategoryProductService;
