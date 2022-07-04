exports.up = (pgm) => {
  pgm.createTable('log_activities', {
    createdby_user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'user_admins',
      onDelete: 'restrict',
    },
    date: {
      type: 'TIMESTAMP',
      notNull: true,
    },
    activity: {
      type: 'TEXT',
      notNull: true,
    },
    refers_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('log_activities');
};
