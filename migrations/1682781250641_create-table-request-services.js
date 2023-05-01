exports.up = (pgm) => {
    pgm.createTable("request_services", {
        request_service_id: {
            type: "VARCHAR(50)",
            primaryKey: true,
        },
        user_id: {
            type: "VARCHAR(50)",
            notNull: true,
            references: "users",
            onDelete: "RESTRICT",
        },
        device: {
            type: "VARCHAR",
            noNull: true,
        },
        brand: {
            type: "VARCHAR",
            notNull: true,
        },
        cracker: {
            type: "VARCHAR",
            notNull: true,
        },
        servicing: {
            type: "VARCHAR",
            notNull: true,
        },
        estimation_price: {
            type: "DOUBLE PRECISION",
            notNull: true,
        },
        real_price: {
            type: "DOUBLE PRECISION",
            notNull: false,
        },
        technician_service: {
            type: "VARCHAR(50)",
            notNull: false,
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
        status: {
            type: "VARCHAR",
            notNull: true,
            default: 'waiting confirmation'
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable("request_services");
};
