exports.up = pgm => {
    pgm.addColumn('request_services', {
        description: {
            type: 'TEXT',
            notNull: false,
        },
        product: {
            type: 'VARCHAR[]', // Tipe data array
            notNull: true,
            default: pgm.func('ARRAY[]::VARCHAR[]'), // Nilai default untuk kolom array
        },
    });
};

exports.down = pgm => {
    pgm.dropColumn('request_services', 'description')
    pgm.dropColumn('request_services', 'product')
};
