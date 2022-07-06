exports.up = (pgm) => {
  pgm.createTable('products', {
    product_id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'VARCHAR',
      notNull: true,
      unique: true,
    },
    price: {
      type: 'DOUBLE PRECISION',
      notNull: true,
    },
    image: {
      type: 'TEXT[]',
      notNull: false,
    },
    type_product: {
      type: 'VARCHAR',
      notNull: true,
    },
    deskripsi_product: {
      type: 'TEXT',
      notNull: false,
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
  pgm.dropTable('products');
};

