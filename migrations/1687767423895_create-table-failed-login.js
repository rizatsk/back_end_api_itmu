exports.up = (pgm) => {
    pgm.createTable("failed_authentications", {
        ip: {
            type: "VARCHAR(50)",
            notNull: true,
        },
        many_test: {
            type: "INTEGER",
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

    pgm.createIndex('failed_authentications', 'ip');
};

exports.down = (pgm) => {
    pgm.dropIndex('failed_authentications', 'ip');
    pgm.dropTable("failed_authentications");
};
