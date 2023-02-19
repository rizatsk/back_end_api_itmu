exports.up = (pgm) => {
  pgm.createTable("auth_role", {
    role_id: {
      type: "INT",
      noNull: true,
      primaryKey: true,
    },
    role_name: {
      type: "VARCHAR(50)",
      notNull: true,
      unique: true,
    },
    access_role: {
      type: "VARCHAR[]",
      notNull: true,
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
  });

  pgm.sql(`INSERT INTO auth_role VALUES
    ('9999', 'super_admin', '{"super_admin"}', '2022-05-30 13:06:49', 'admin-00000001', '2022-05-30 13:06:49', 'admin-00000001')`);
};

exports.down = (pgm) => {
  pgm.dropTable("auth_role");
};
