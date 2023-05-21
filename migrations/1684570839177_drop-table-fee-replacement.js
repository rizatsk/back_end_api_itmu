exports.up = (pgm) => {
    pgm.dropTable("fee_replacements");
    pgm.dropColumn("products", "fee_replacement_id");
    pgm.dropColumn("products", "sale");
};

exports.down = (pgm) => {
    pgm.createTable("fee_replacements", {
        fee_replacement_id: {
            type: "VARCHAR(50)",
            notNull: true,
            primaryKey: true,
        },
        name: {
            type: "VARCHAR",
            notNull: true,
            unique: true,
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

    pgm.addColumn("products", {
        fee_replacement_id: {
            type: "VARCHAR(50)",
            notNull: false,
        },
    });

    pgm.addColumn("products", {
        sale: {
            type: "BOOLEAN",
            notNull: true,
            default: true,
        },
    });
};
