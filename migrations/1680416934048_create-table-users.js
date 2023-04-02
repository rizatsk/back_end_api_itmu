exports.up = (pgm) => {
  pgm.createTable("users", {
    user_id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    fullname: {
      type: "TEXT",
      notNull: true,
    },
    email: {
      type: "VARCHAR",
      unique: true,
      noNull: true,
    },
    no_handphone: {
      type: "VARCHAR(20)",
      unique: true,
      notNull: true,
    },
    password: {
      type: "VARCHAR",
      noNull: true,
    },
    created_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    status: {
      type: "BOOLEAN",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("users");
};
