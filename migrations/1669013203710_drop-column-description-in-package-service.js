exports.up = (pgm) => {
  pgm.dropColumn("package_services", "description");
};

exports.down = (pgm) => {};
