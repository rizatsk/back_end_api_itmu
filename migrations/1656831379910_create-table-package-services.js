exports.up = (pgm) => {
  pgm.createTable("package_services", {
    package_service_id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    name: {
      type: "VARCHAR",
      notNull: true,
      unique: true,
    },
    products: {
      type: "VARCHAR[]",
      notNull: true,
    },
    price: {
      type: "DOUBLE PRECISION",
      notNull: true,
    },
    type_service: {
      type: "VARCHAR",
      notNull: true,
    },
    deskripsi_package: {
      type: "TEXT",
      notNull: false,
    },
    created: {
      type: "TIMESTAMP",
      notNull: true,
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
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("package_services");
};
