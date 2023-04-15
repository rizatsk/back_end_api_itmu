exports.up = (pgm) => {
  pgm.createTable("categories_product", {
    category_product_id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    parent_id: {
      type: "VARCHAR(50)",
      notNull: false,
    },
    name: {
      type: "VARCHAR",
      noNull: true,
    },
  });

  // Menambahkan indeks pada kolom 'name'
  pgm.addIndex("categories_product", "parent_id");
  pgm.addIndex("categories_product", ["parent_id", "name"], { unique: true });
};

exports.down = (pgm) => {
  pgm.dropIndex("categories_product", ["parent_id", "name"]);
  pgm.dropIndex("categories_product", "parent_id");
  pgm.dropTable("categories_product");
};
