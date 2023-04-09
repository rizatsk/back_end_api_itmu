exports.up = (pgm) => {
  pgm.createTable("categories_product", {
    category_product_id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    parent_id: {
      type: "VARCHAR(50)",
      notNull: false,
      references: "categories_product",
    },
    name: {
      type: "VARCHAR",
      unique: true,
      noNull: true,
    },
  });

  // Menambahkan indeks pada kolom 'name'
  pgm.addIndex("categories_product", "name");
};

exports.down = (pgm) => {
  pgm.dropIndex("categories_product", "name");
  pgm.dropTable("categories_product");
};
