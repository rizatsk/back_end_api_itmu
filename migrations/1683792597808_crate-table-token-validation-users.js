exports.up = (pgm) => {
    pgm.createTable("token_validation_users", {
        user_id: {
            type: "VARCHAR(50)",
            notNull: true,
        },
        token: {
            type: "TEXT",
            notNull: true,
        },
        created_at: {
            type: "TIMESTAMP",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
    });

    pgm.createIndex('token_validation_users', 'user_id');

    pgm.createIndex('token_validation_users', 'token');
};

exports.down = (pgm) => {
    pgm.dropIndex('token_validation_users', 'token');
    pgm.dropIndex('token_validation_users', 'user_id');
    pgm.dropTable("token_validation_users");
};
