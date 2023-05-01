exports.up = (pgm) => {
    pgm.addColumn("products", {
        sale: {
            type: "BOOLEAN",
            notNull: true,
            default: true,
        },
        sparepart: {
            type: "BOOLEAN",
            notNull: true,
            default: false,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropColumn("products", "sparepart");
    pgm.dropColumn("products", "sale");
};
