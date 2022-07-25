const {Pool} = require('pg');
const bcrypt = require('bcrypt');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const InvariantError = require('../../exceptions/InvariantError');
const {nanoid} = require('nanoid');
const getDateTime = require('../../utils/getDateTime');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  // Check data user saat login
  async verifyAdminUserCredential({parameter, password}) {
    const regexEmail = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    const type = regexEmail.test(parameter) === true ? 'email' : 'username';

    const query = {
      text: `SELECT admin_id, password, status FROM user_admins WHERE ${type} = $1`,
      values: [parameter],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(`${type} yang anda berikan salah`);
    }

    const {admin_id: adminId, password: hashedPassword, status} = result.rows[0];
    if (status === false) {
      throw new AuthenticationError('User tidak aktif');
    }

    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      throw new AuthenticationError('Password yang anda berikan salah');
    }

    return {adminId};
  }

  // CheckCredentialAdminItindo
  async verifyAdminItindoCredential(credentialUserId) {
    if (credentialUserId !== 'admin-00000001') throw new AuthenticationError('Anda tidak berhak akses');
  }

  async verifyAdminItindoCredentialForOtherAdminUser({credentialUserId, inputUserId}) {
    if (inputUserId != null) {
      if (credentialUserId !== 'admin-00000001') throw new AuthenticationError('Anda tidak berhak akses');
    }
  }

  // Get user admin
  async getAdminUser() {
    const query = {
      text: 'SELECT admin_id, fullname, username, fullname, email FROM user_admins',
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  // Get data user By Id
  async getAdminUserById(id) {
    const query = {
      text: `SELECT admin_id,fullname, username, email FROM user_admins WHERE admin_id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Admin user tidak ada');
    }

    return result.rows[0];
  }

  // Ganti Password
  async editPasswordAdminUser({credentialUserId, passwordOld, passwordNew}) {
    const hashedPasswordOld = await this.getPasswordAdminUserById(credentialUserId);

    const match = await bcrypt.compare(passwordOld, hashedPasswordOld);
    if (!match) {
      throw new AuthenticationError('Password yang anda berikan salah');
    }

    const hashedPassword = await bcrypt.hash(passwordNew, 10);
    const query = {
      text: `UPDATE user_admins SET password = $2, updated = $3, updatedby_user_id = $1 WHERE admin_id = $1`,
      values: [credentialUserId, hashedPassword, getDateTime()],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal mengubah password, admin_user id tidak ditemukan');
    }
  }

  async getPasswordAdminUserById(userId) {
    const query = {
      text: `SELECT password FROM user_admins WHERE admin_id = $1`,
      values: [userId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal mengubah password, admin_user id tidak ditemukan');
    }

    return result.rows[0].password;
  }

  // Admin User
  async addAdminUser({fullname, username, email, password,
    createdby_user_id}) {
    await this.verifyNewUsernameOrEmailAdminUser(username);
    await this.verifyNewUsernameOrEmailAdminUser(email);

    const id = `admin-${nanoid(8)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const dateTime = getDateTime();
    const status = true;

    const query = {
      text: `INSERT INTO user_admins VALUES($1, $2, $3, $4, $5
            , $6, $7, $6, $7, $8) RETURNING admin_id`,
      values: [id, fullname, username, email, hashedPassword,
        dateTime, createdby_user_id, status],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Register gagal!');
    }

    const adminId = result.rows[0].admin_id;

    return adminId;
  }

  async verifyNewUsernameOrEmailAdminUser(parameter) {
    const regexEmail = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    const type = regexEmail.test(parameter) === true ? 'email' : 'username';

    const query = {
      text: `SELECT admin_id FROM user_admins WHERE ${type} = $1`,
      values: [parameter],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError(`Gagal menambahkan user, ${type} sudah digunakan`);
    }
  }
  // End

  // Edit user
  async editAdminUserById({credentialUserId, userId, fullname, email}) {
    await this.verifyNewUsernameOrEmailAdminUser(email);

    const query = {
      text: 'UPDATE user_admins SET fullname = $2, email = $3, updated = $4, updatedby_user_id = $5 WHERE admin_id = $1',
      values: [userId, fullname, email, getDateTime(), credentialUserId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Gagal edit admin user, user id tidak ditemukan');
  }

  // Edit Status User
  async editStatusAdminUserById({credentialUserId, userId, status}) {
    const query = {
      text: 'UPDATE user_admins SET status = $1, updated = $2, updatedby_user_id = $3 WHERE admin_id = $4',
      values: [status, getDateTime(), credentialUserId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Gagal edit status admin user, user id tidak ditemukan');
  }
}

module.exports = UsersService;
