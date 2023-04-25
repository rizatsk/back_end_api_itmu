const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const { MappingCategoriesProduct, mappedDataCategories } = require("../../utils/MappingResultDB");
const NotFoundError = require("../../exceptions/NotFoundError");
const getTwoLevelCategories = require("../../utils/getTwoLevelCategories");

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
      values: [id, parentId, name.toLowerCase(), credentialUserId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount)
      throw new InvariantError("Gagal menambahkan category product");

    return result.rows[0].category_product_id;
  }

  async checkAddCategoryProductName(name, parentId) {
    const query = {
      text: parentId ?
        `SELECT * FROM categories_product WHERE name = $1 AND 
        parent_id = $2`:
        `SELECT * FROM categories_product WHERE name = $1 AND 
        parent_id IS NULL`,
      values: parentId ? [name, parentId] : [name],
    };

    const result = await this._pool.query(query);
    if (result.rowCount)
      throw new InvariantError(
        "Name category, parent id is available"
      );
  }

  async getCountCategories(search) {
    search = search ? `%${search.toLowerCase()}%` : '%%';
    const query = {
      text: "SELECT count(*) AS count FROM categories_product WHERE LOWER(name) LIKE $1",
      values: [search]
    };

    const result = await this._pool.query(query);
    return result.rows[0].count;
  }

  async getCategories({ limit, offset, search }) {
    search = search ? `%${search.toLowerCase()}%` : '%%';
    const query = {
      text: `SELECT * FROM categories_product WHERE LOWER(name) LIKE $3 ORDER BY created DESC LIMIT $1 OFFSET $2`,
      values: [limit, offset, search],
    };

    const result = await this._pool.query(query);
    const categories = result.rows;
    for (let i = 0; i < categories.length; i++) {
      categories[i].parent = await this.getCategoriesParentAndChildForById(
        categories[i].parent_id,
        null,
        categories[i].name
      ); // Menambahkan 3 ke nilai kolom 'age'
    }
    return categories;
  }

  async getCategoriesParentIdAndName() {
    const query = {
      text:
        "SELECT category_product_id, parent_id, name FROM categories_product WHERE status = true",
    };

    const result = await this._pool.query(query);
    const categoriesAll = result.rows;
    const categories = getTwoLevelCategories(categoriesAll);

    for (let i = 0; i < categories.length; i++) {
      categories[i].parentName = await this.getCategoriesParentAndChild(
        categories[i].parent_id,
        categories[i].name
      );
    }

    let data = categories.map(MappingCategoriesProduct);
    data.sort(function (a, b) {
      return a.parentName.localeCompare(b.parentName);
    });
    return data;
  }

  async getCategoriesParentAndChild(parentId, name) {
    if (parentId == null) return name;

    let parent = await this.getCategoryByParentId(parentId);
    name = `${parent.name} > ${name}`;
    if (parent.parent_id == null) return name;

    return await this.getCategoriesParentAndChild(parent.parent_id, name);
  }

  async getCategoriesParentName(parentId, parentName = null, name) {
    if (parentId == null) return name;

    let parent = await this.getCategoryByParentId(parentId);
    name = parentName !== null ? `${parent.name} > ${name}` : parent.name;
    if (parent.parent_id == null) return name;

    return await this.getCategoriesParentName(parent.parent_id, parent.name, name);
  }

  async getCategoryByParentId(id) {
    const query = {
      text:
        "SELECT category_product_id, parent_id, name FROM categories_product WHERE category_product_id = $1",
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
    const datas = result.rows;
    for (let i = 0; i < datas.length; i++) {
      datas[i].parentName = await this.getCategoriesParentAndChild(
        datas[i].parent_id,
        datas[i].name
      );
    }
    const categories = mappedDataCategories(datas, null)

    return categories;
  }

  async updateStatusCategoryById(id, status) {
    const query = {
      text: `
          UPDATE categories_product SET status = $2 WHERE category_product_id = $1`,
      values: [id, status],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount)
      throw new InvariantError(
        "Gagal update status category product, category id tidak ditemukan"
      );
  }

  async getCategoryById(id) {
    const query = {
      text:
        "SELECT category_product_id, parent_id, name FROM categories_product WHERE category_product_id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Category tidak ditemukan');

    const category = result.rows[0]
    category.parentName = await this.getCategoriesParentAndChildForById(
      category.parent_id,
      null,
      category.name
    );

    return category;
  }

  async getCategoriesParentAndChildForById(parentId, parentName = null, name) {
    if (parentId == null) return '';

    let parent = await this.getCategoryByParentId(parentId);
    name = parentName !== null ? `${parent.name} > ${name}` : parent.name;
    if (parent.parent_id == null) return name;

    return await this.getCategoriesParentAndChildForById(parent.parent_id, parent.name, name);
  }

  async getCategoryByIdForProduct(id) {
    const query = {
      text:
        "SELECT category_product_id, parent_id, name FROM categories_product WHERE category_product_id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Category tidak ditemukan');

    const category = result.rows[0]
    category.parentName = await this.getCategoriesParentAndChild(
      category.parent_id,
      category.name
    );

    return category;
  }

  async deleteCategoryAndChild(id) {
    const query = {
      text: `
          DELETE FROM categories_product WHERE category_product_id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount)
      throw new InvariantError(
        "Gagal hapus status category product, category id tidak ditemukan"
      );
  }

  async updateCategoryById({ categoryId, parentId, name }) {
    parentId = parentId || null;
    await this.checkEditCategoryProductName({ categoryId, parentId, name });

    const query = {
      text: `UPDATE categories_product SET parent_id = $2, name = $3
        WHERE category_product_id = $1`,
      values: [categoryId, parentId, name.toLowerCase()]
    };

    const result = await this._pool.query(query)
    if (!result.rowCount)
      throw new InvariantError(
        "Gagal update category product, category id tidak ditemukan"
      );
  }

  async checkEditCategoryProductName({ categoryId, parentId, name }) {
    const query = {
      text:
        `SELECT * FROM categories_product WHERE name = $3 AND parent_id = $2
          AND category_product_id != $1`,
      values: [categoryId, parentId, name],
    };

    const result = await this._pool.query(query);
    if (result.rowCount)
      throw new InvariantError(
        "Name category, parent id is available"
      );
  }
}

module.exports = CategoryProductService;
