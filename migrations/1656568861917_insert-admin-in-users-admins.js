exports.up = (pgm) => {
  pgm.sql(`INSERT INTO user_admins VALUES('admin-00000001', 'admin itindo', 
    'itindo', 'itindo@gmail.com', '$2b$10$CJYg6URBJSQMI6hiACB/6O/NLU.mp8GZwlFJ7/4uVYRjexKqiZEsW', '2022-05-30 13:06:49',
    'admin-00000001', '2022-05-30 13:06:49', 'admin-00000001', true)`);
};

exports.down = (pgm) => {
  pgm.sql(`DELETE FROM user_admins WHERE admin_id = 'admin-00000001'`);
};
