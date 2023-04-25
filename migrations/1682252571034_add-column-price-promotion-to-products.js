exports.up = (pgm) => {
    pgm.addColumn("products", {
        price_promotion: {
            type: "DOUBLE PRECISION",
            notNull: false,
            default: null,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropColumn("products", "price_promotion");
};
