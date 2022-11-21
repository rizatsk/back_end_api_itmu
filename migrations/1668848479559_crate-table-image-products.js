exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("image_products", {
    image_product_id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    product_id: {
      type: "VARCHAR(50)",
      references: "products",
      onDelete: "CASCADE",
    },
    link: {
      type: "VARCHAR",
      notNull: true,
      unique: true,
    },
    created: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("image_products");
};
