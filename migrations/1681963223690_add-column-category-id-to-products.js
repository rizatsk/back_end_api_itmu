exports.up = (pgm) => {
    pgm.addColumn("products", {
        category_id: {
            type: "VARCHAR(50)",
            notNull: false,
            references: "categories_product",
            onDelete: 'RESTRICT',
        },
    });
};

exports.down = (pgm) => {
    pgm.dropColumn("products", "category_id");
};
