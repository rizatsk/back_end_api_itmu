exports.up = (pgm) => {
    pgm.dropColumn("request_services", "technician_service");
};

exports.down = (pgm) => {
    pgm.addColumn("request_services", {
        technician_service: {
            type: "VARCHAR(50)",
            notNull: false,
        },
    });
};
