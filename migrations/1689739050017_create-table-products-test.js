exports.up = (pgm) => {
    pgm.createTable("products_test", {
        product_id: {
            type: "VARCHAR(50)",
            primaryKey: true,
        },
        name: {
            type: "VARCHAR",
            notNull: true,
            unique: true,
        },
        buy_price: {
            type: "DOUBLE PRECISION",
            notNull: true,
        },
        sale_price: {
            type: "DOUBLE PRECISION",
            notNull: true,
        },
        stock: {
            type: "BIGINT",
            notNull: true,
        },
        foto_product: {
            type: "TEXT",
            notNull: true,
        },
        created: {
            type: "TIMESTAMP",
            notNull: true,
        },
        updated: {
            type: "TIMESTAMP",
            notNull: true,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable("products_test");
};
