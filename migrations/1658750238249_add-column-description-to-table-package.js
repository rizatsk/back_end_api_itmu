exports.up = (pgm) => {
  pgm.addColumn("package_services", {
    description: {
      type: "TEXT",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("package_services", "description");
};
