const {Pool} = require('pg');
const getDateTime = require('../../utils/getDateTime');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class PackageServiceService {
  constructor() {
    this._pool = new Pool();
  }

  async addPackageService({credentialUserId, name, products, price, typeService}) {
    await this.verifyNewNamePackageService(name);

    const status = 'true';
    const id = `package-${nanoid(8)}`;

    const query = {
      text: `INSERT INTO package_services(package_service_id, name, products,
        price, type_service, created, createdby_user_id, updated, updatedby_user_id, status) 
        VALUES($1, $2, $3::varchar[], $4, $5, $6, $7, $6, $7, $8) RETURNING package_service_id`,
      values: [id, name, products, price, typeService, getDateTime(), credentialUserId,
        status],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Gagal menambahkan paket pelayanan');

    return result.rows[0].package_service_id;
  }

  async verifyNewNamePackageService(name) {
    const query = {
      text: 'SELECT name FROM package_services WHERE name = $1',
      values: [name],
    };

    const result = await this._pool.query(query);
    if (result.rowCount > 0) throw new InvariantError('nama paket pelayanan sudah digunakan');
  }

  async getPackageServices() {
    const query = {
      text: `SELECT package_service_id, name, products, price, 
      image, type_service, status FROM package_services`,
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getPackageServiceById(packageServiceId) {
    const query = {
      text: 'SELECT * FROM package_services WHERE package_service_id = $1',
      values: [packageServiceId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Package service tidak ditemukan');

    return result.rows[0];
  }

  async editPackageServicesById({credentialUserId, packageServiceId, name, products, price, typeService}) {
    const query = {
      text: `UPDATE package_services SET name = $1, products = $2::varchar[], price = $3, 
        type_service = $4, updated = $5, updatedby_user_id = $6
        WHERE package_service_id = $7`,
      values: [name, products, price, typeService, getDateTime(), credentialUserId, packageServiceId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Gagal edit package service, package service id tidak ditemukan');
  }

  async editStatusPackageServiceById({credentialUserId, packageServiceId, status}) {
    const query = {
      text: `UPDATE package_services SET status = $1, updated = $2, updatedby_user_id = $3
        WHERE package_service_id = $4`,
      values: [status, getDateTime(), credentialUserId, packageServiceId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Gagal edit status package service, package service id tidak ditemukan');
  }

  async addImagePackageService({credentialUserId, packageServiceId, imageUrl}) {
    const images = [];
    images.push(imageUrl);

    const query = {
      text: `UPDATE package_services SET image = $1::text[], updated = $2, updatedby_user_id = $3
        WHERE package_service_id = $4`,
      values: [images, getDateTime(), credentialUserId, packageServiceId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Gagal menambahkan foto package service, package service id tidak ditemukan');
  }

  async deleteImagePackgeService(credentialUserId, packageServiceId) {
    const query = {
      text: `UPDATE package_services SET image = null, updated = $2, updatedby_user_id = $3 
        WHERE package_service_id = $1`,
      values: [packageServiceId, getDateTime(), credentialUserId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Gagal menghapus gambar package service, package service id tidak ditemukan');
  }

  async checkPackageServiceId(packageServiceId) {
    const query = {
      text: 'SELECT package_service_id, image[1] FROM package_services WHERE package_service_id = $1',
      values: [packageServiceId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Gagal upload image package service, package service id tidak ditemukan');

    const {image} = result.rows[0];
    if (image != null) {
      const fileName = image.split('/');
      const previousFilename = fileName[fileName.length -1];
      return previousFilename;
    } else {
      return null;
    }
  }
}

module.exports = PackageServiceService;
