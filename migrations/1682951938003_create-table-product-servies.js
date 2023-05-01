exports.up = (pgm) => {
    pgm.createTable("product_services", {
        product_service_id: {
            type: "VARCHAR(50)",
            notNull: true,
            primaryKey: true,
        },
        name: {
            type: "VARCHAR",
            notNull: true,
        },
        service: {
            type: "VARCHAR",
            notNull: true,
        },
        price: {
            type: "DOUBLE PRECISION",
            notNull: true,
        },
        created_at: {
            type: "TIMESTAMP",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
        updated_at: {
            type: "TIMESTAMP",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
    });

    pgm.addConstraint('product_services', 'unique_name_service', {
        unique: ['name', 'service']
    });
};

exports.down = (pgm) => {
    pgm.dropConstraint('product_services', 'unique_name_service');
    pgm.dropTable("product_services");
};
