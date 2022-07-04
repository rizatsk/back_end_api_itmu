exports.up = (pgm) => {
  pgm.createTable('package_services', {
    package_service_id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'VARCHAR',
      notNull: true,
    },
    products: {
      type: 'TEXT[]',
      notNull: true,
    },
    price: {
      type: 'DOUBLE PRECISION',
      notNull: true,
    },
    image: {
      type: 'VARCHAR',
      notNull: false,
    },
    type_service: {
      type: 'VARCHAR',
      notNull: true,
    },
    created: {
      type: 'TIMESTAMP',
      notNull: true,
    },
    createdby_user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'user_admins',
      onDelete: 'restrict',
    },
    updated: {
      type: 'TIMESTAMP',
      notNull: true,
    },
    updatedby_user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'user_admins',
      onDelete: 'restrict',
    },
    status: {
      type: 'BOOLEAN',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('package_services');
};
