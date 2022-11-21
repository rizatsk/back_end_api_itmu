exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("image_packages", {
    image_package_id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    package_id: {
      type: "VARCHAR(50)",
      references: "package_services",
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
  pgm.dropTable("image_packages");
};
