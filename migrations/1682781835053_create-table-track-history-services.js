exports.up = (pgm) => {
    pgm.createTable("track_history_services", {
        request_service_id: {
            type: "VARCHAR(50)",
            notNull: true,
            references: "request_services",
            onDelete: "RESTRICT",
        },
        status: {
            type: "VARCHAR",
            notNull: true,
        },
        created_at: {
            type: "TIMESTAMP",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
        created_user_id: {
            type: "VARCHAR(50)",
            notNull: true,
            references: "user_admins",
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable("track_history_services");
};
