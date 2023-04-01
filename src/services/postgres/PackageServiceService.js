const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");

class PackageServiceService {
  constructor({ pool }) {
    this._pool = pool;
  }

  async addPackageService({
    credentialUserId,
    name,
    products,
    price,
    typeService,
    description,
  }) {
    await this.verifyNewNamePackageService(name);

    const status = "true";
    const id = `package-${nanoid(8)}`;
    const date = new Date();

    const query = {
      text: `INSERT INTO package_services(package_service_id, name, products,
        price, type_service, created, createdby_user_id, updated, updatedby_user_id, status, deskripsi_package) 
        VALUES($1, $2, $3::varchar[], $4, $5, $6, $7, $6, $7, $8, $9) RETURNING package_service_id`,
      values: [
        id,
        name,
        products,
        price,
        typeService,
        date,
        credentialUserId,
        status,
        description,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount)
      throw new InvariantError("Gagal menambahkan paket pelayanan");

    return result.rows[0].package_service_id;
  }

  async verifyNewNamePackageService(name) {
    const query = {
      text: "SELECT name FROM package_services WHERE name = $1",
      values: [name],
    };

    const result = await this._pool.query(query);
    if (result.rowCount > 0)
      throw new InvariantError("nama paket pelayanan sudah digunakan");
  }

  async getCountPackageServices(search) {
    const query = {
      text: `SELECT count(*) AS count FROM package_services WHERE name LIKE '%${search}%'`,
    };

    const result = await this._pool.query(query);

    return result.rows[0].count;
  }

  async getPackageServices({ limit, offset, search }) {
    const query = {
      text: `SELECT package_service_id, name, products, price, 
      type_service, status, deskripsi_package FROM package_services
      WHERE name LIKE '%${search}%'
      LIMIT $1 OFFSET $2`,
      values: [limit, offset],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getPackageServiceById(packageServiceId) {
    const query = {
      text: "SELECT * FROM package_services WHERE package_service_id = $1",
      values: [packageServiceId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount)
      throw new InvariantError("Package service tidak ditemukan");

    return result.rows[0];
  }

  async editPackageServicesById({
    credentialUserId,
    packageServiceId,
    name,
    products,
    price,
    typeService,
    description,
  }) {
    const date = new Date();

    const query = {
      text: `UPDATE package_services SET name = $1, products = $2::varchar[], price = $3, 
        type_service = $4, updated = $5, updatedby_user_id = $6, deskripsi_package = $8
        WHERE package_service_id = $7`,
      values: [
        name,
        products,
        price,
        typeService,
        date,
        credentialUserId,
        packageServiceId,
        description,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount)
      throw new InvariantError(
        "Gagal edit package service, package service id tidak ditemukan"
      );
  }

  async editStatusPackageServiceById({
    credentialUserId,
    packageServiceId,
    status,
  }) {
    const date = new Date();
    const query = {
      text: `UPDATE package_services SET status = $1, updated = $2, updatedby_user_id = $3
        WHERE package_service_id = $4`,
      values: [status, date, credentialUserId, packageServiceId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount)
      throw new InvariantError(
        "Gagal edit status package service, package service id tidak ditemukan"
      );
  }

  async addImagePackageService(packageServiceId, imageUrl) {
    const id = `image-package-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO image_packages(image_package_id, package_id, link) VALUES($1, $2, $3) RETURNING image_package_id`,
      values: [id, packageServiceId, imageUrl],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount)
      throw new InvariantError(
        "Gagal upload image package, package service id tidak ditemukan"
      );

    return result.rows[0].id;
  }

  async getImagePackages(packageId) {
    const query = {
      text: `SELECT image_package_id AS imagePackageId, link FROM image_packages WHERE package_id = $1`,
      values: [packageId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getImagePackageName(imagePackageId) {
    const query = {
      text: `SELECT link FROM image_packages WHERE image_package_id = $1`,
      values: [imagePackageId],
    };

    const result = await this._pool.query(query);
    return result.rows[0].link;
  }

  async deleteImagePacakge(imagePackageId, packageId) {
    const query = {
      text: `DELETE FROM image_packages WHERE image_package_id = $2 AND package_id = $1`,
      values: [packageId, imagePackageId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount)
      throw new InvariantError(
        "Gagal menghapus gambar package, package service id tidak ditemukan"
      );
  }
}

module.exports = PackageServiceService;
