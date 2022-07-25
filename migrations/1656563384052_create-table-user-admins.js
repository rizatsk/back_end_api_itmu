exports.up = (pgm) => {
  pgm.createTable('user_admins', {
    admin_id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    fullname: {
      type: 'TEXT',
      notNull: true,
    },
    username: {
      type: 'VARCHAR(50)',
      unique: true,
      notNull: true,
    },
    email: {
      type: 'VARCHAR',
      unique: true,
      noNull: true,
    },
    password: {
      type: 'VARCHAR',
      noNull: true,
    },
    created: {
      type: 'TIMESTAMP',
      notNull: true,
    },
    createdby_user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'user_admins',
      // onDelete: 'SET NULL',
    },
    updated: {
      type: 'TIMESTAMP',
      notNull: true,
    },
    updatedby_user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'user_admins',
      // onDelete: 'SET NULL',
    },
    status: {
      type: 'BOOLEAN',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('user_admins');
};
