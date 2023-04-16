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
    created: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    createdby_user_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "user_admins",
      onDelete: "restrict",
    },
    updated: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updatedby_user_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "user_admins",
      onDelete: "restrict",
    },
    status: {
      type: "BOOLEAN",
      notNull: true,
      default: true,
    },
  });

  // Menambahkan indeks pada kolom 'name'
  pgm.addIndex("categories_product", "parent_id");
  pgm.addIndex("categories_product", ["parent_id", "name"], { unique: true });
};

exports.down = (pgm) => {
  pgm.dropTable("categories_product");
};
