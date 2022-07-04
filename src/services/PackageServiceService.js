const {Pool} = require('pg');
const getDateTime = require('../utils/getDateTime');
const {nanoid} = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');

class PackageServiceService {
  constructor() {
    this._pool = new Pool();
  }

  async postPackageService({credentialUserId, name, products, price, typeService}) {
    await this.verifyNewNamePackageService(name);

    const status = 'true';
    const id = `package-${nanoid(8)}`;

    const query = {
      text: `INSERT INTO package_services(package_service_id, name, products,
        price, type_service, created, createdby_user_id, updated, updatedby_user_id, status) 
        VALUES($1, $2, $3::text[], $4, $5, $6, $7, $8, $9, $10) RETURNING package_service_id`,
      values: [id, name, products, price, typeService, getDateTime(), credentialUserId,
        getDateTime(), credentialUserId, status],
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
      text: 'SELECT * FROM package_services',
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

  async updatePackageServicesById({credentialUserId, packageServiceId, name, products, price, typeService}) {
    const query = {
      text: `UPDATE package_services SET name = $1, products = $2::text[], price = $3, 
        type_service = $4, updated = $5, updatedby_user_id = $6
        WHERE package_service_id = $7`,
      values: [name, products, price, typeService, getDateTime(), credentialUserId, packageServiceId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Gagal update package service');
  }

  async updateStatusPackageServiceById({credentialUserId, packageServiceId, status}) {
    const query = {
      text: `UPDATE package_services SET status = $1, updated = $2, updatedby_user_id = $3
        WHERE package_service_id = $4`,
      values: [status, getDateTime(), credentialUserId, packageServiceId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Gagal update status package service');
  }
}

module.exports = PackageServiceService;
