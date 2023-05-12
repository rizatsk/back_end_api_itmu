exports.up = (pgm) => {
    pgm.addColumn("users", {
        email_verified: {
            type: "BOOLEAN",
            notNull: false,
            default: false,
        },
    });

};

exports.down = (pgm) => {
    pgm.dropColumn("users", "email_verified");
};
