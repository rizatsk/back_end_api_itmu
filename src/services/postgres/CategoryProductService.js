const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const { MappingCategoriesProduct, mappedDataCategories } = require("../../utils/MappingResultDB");
const NotFoundError = require("../../exceptions/NotFoundError");

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
        "Name category, parent id is available"
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
        "SELECT category_product_id, parent_id, name FROM categories_product WHERE status = true",
    };

    const result = await this._pool.query(query);
    const categoriesAll = result.rows;
    const categories = this.getTwoLevelCategories(categoriesAll);

    for (let i = 0; i < categories.length; i++) {
      categories[i].parentName = await this.getCategoriesParentHandler(
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

  getTwoLevelCategories(categories) {
    const result = [];

    categories.forEach(function (category) {
      if (category.parent_id === null) {
        // Jika kategori tidak memiliki parent, tambahkan ke hasil
        result.push(category);
      } else {
        const parent = categories.find(function (parent) {
          return parent.category_product_id === category.parent_id;
        });

        if (parent && parent.parent_id === null) {
          // Jika kategori memiliki parent yang hanya memiliki parent
          // (2 level), tambahkan ke hasil
          result.push(category);
        }
      }
    });

    return result;
  }

  // async getCategoriesIdAndName() {
  //   const query = {
  //     text:
  //       "SELECT category_product_id, parent_id, name FROM categories_product WHERE parent_id IS NULL",
  //   };

  //   const result = await this._pool.query(query);
  //   const categoriesParent = result.rows;
  //   for (let i = 0; i < categories.length; i++) {
  //     categories[i].parentName = await this.getCategoriesParentHandler(
  //       categories[i].parent_id,
  //       categories[i].name
  //     );
  //   }

  //   let data = categories.map(MappingCategoriesProduct);
  //   data.sort(function (a, b) {
  //     return a.parentName.localeCompare(b.parentName);
  //   });
  //   return data;
  // }

  async getCategoriesParentHandler(parentId, name) {
    if (parentId == null) return name;

    let parent = await this.getCategoryByParentId(parentId);
    name = `${parent.name} > ${name}`;
    if (parent.parent_id == null) return name;

    return await this.getCategoriesParentHandler(parent.parent_id, name);
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
    const data = result.rows;
    const categories = mappedDataCategories(data, null)

    return categories;
  }

  async updateStatusCategoryById(id, status) {
    const query = {
      text: `
          UPDATE categories_product SET status = $2 WHERE category_product_id = $1`,
      values: [id, status],
    };

    await this._pool.query(query);
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
    category.parentName = await this.getCategoriesParentHandler(
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

    await this._pool.query(query);
  }

  async updateCategoryById({ categoryId, parentId, name }) {
    parentId = parentId || null;
    await this.checkEditCategoryProductName({ categoryId, parentId, name });

    const query = {
      text: `UPDATE categories_product SET parent_id = $2, name = $3
        WHERE category_product_id = $1`,
      values: [categoryId, parentId, name]
    };

    await this._pool.query(query)
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
