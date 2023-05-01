exports.up = (pgm) => {
    pgm.addColumn("products", {
        fee_replacement_id: {
            type: "VARCHAR(50)",
            notNull: false,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropColumn("products", "fee_replacement_id");
};
