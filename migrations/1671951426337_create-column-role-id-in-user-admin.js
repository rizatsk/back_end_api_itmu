exports.up = (pgm) => {
  pgm.addColumn("user_admins", {
    role_id: {
      type: "INT",
      references: "auth_role",
      onDelete: "RESTRICT",
    },
  });

  pgm.sql(
    `UPDATE user_admins SET role_id = '9999' WHERE admin_id = 'admin-00000001'`
  );
};

exports.down = (pgm) => {
  pgm.dropTable("user_admins", "role_id");
};
