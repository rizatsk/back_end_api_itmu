exports.up = (pgm) => {
  pgm.createTable('authentications', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    token: {
      type: 'TEXT',
      notNull: true,
    },
    ip: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    device: {
      type: 'VARCHAR',
      noNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('authentications');
};

