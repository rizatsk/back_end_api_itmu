exports.up = (pgm) => {
  pgm.sql(`INSERT INTO auth_role VALUES
    ('0001', 'admin', '{"insert_product"}', '2022-05-30 13:06:49', 'admin-00000001', '2022-05-30 13:06:49', 'admin-00000001')`);

  pgm.sql(`INSERT INTO user_admins VALUES('admin-00000002', 'Rizat service', 
      'rizatservice', 'rizatservice@gmail.com', '$2b$10$CJYg6URBJSQMI6hiACB/6O/NLU.mp8GZwlFJ7/4uVYRjexKqiZEsW', '2023-02-20 13:06:49',
      'admin-00000001', '2023-02-20 13:06:49', 'admin-00000001', true, '0001')`);
};

exports.down = (pgm) => {
  // pgm.sql("DROP table user_admins");
  pgm.sql(`DELETE FROM user_admins WHERE admin_id = 'admin-00000002'`);
  pgm.sql(`DELETE FROM auth_role WHERE role_id = '0001'`);
};
