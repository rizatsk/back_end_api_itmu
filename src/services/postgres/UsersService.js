const bcrypt = require("bcrypt");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");
const InvariantError = require("../../exceptions/InvariantError");
const { nanoid } = require("nanoid");

class UsersService {
  constructor({ pool }) {
    this._pool = pool;
  }

  // Check data user admin saat login
  async verifyAdminUserCredential({ parameter, password }) {
    const regexEmail = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
    const type = regexEmail.test(parameter) === true ? "email" : "username";

    const query = {
      text: `SELECT admin_id, password, status FROM user_admins WHERE ${type} = $1`,
      values: [parameter],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(`${type} yang anda berikan salah`);
    }

    const {
      admin_id: adminId,
      password: hashedPassword,
      status,
    } = result.rows[0];
    if (status === false) {
      throw new AuthenticationError("User tidak aktif");
    }

    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      throw new AuthenticationError("Password yang anda berikan salah");
    }

    return { adminId };
  }

  // Get user admin
  async getCountAdminUser(search) {
    search = search ? `%${search.toLowerCase()}%` : '%%';
    const query = {
      text: "SELECT count(*) AS count FROM user_admins WHERE LOWER(username) LIKE $1 AND admin_id != 'admin-00000001'",
      values: [search]
    };

    const result = await this._pool.query(query);
    return result.rows[0].count;
  }

  async getAdminUsers({ limit, offset, search }) {
    search = search ? `%${search.toLowerCase()}%` : '%%';
    const query = {
      text:
        `SELECT admin_id, fullname, username, fullname, 
        email, role_name 
        FROM user_admins JOIN auth_role ON
        user_admins.role_id = auth_role.role_id
        WHERE LOWER(username) LIKE $3 AND admin_id != 'admin-00000001'
        ORDER BY user_admins.created DESC LIMIT $1 OFFSET $2`,
      values: [limit, offset, search],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  // Get data user By Id
  async getAdminUserById(id) {
    const query = {
      text: `SELECT admin_id, fullname, username, email,
        user_admins.role_id, role_name FROM user_admins
        JOIN auth_role ON
        user_admins.role_id = auth_role.role_id
        WHERE admin_id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Admin user tidak ada");
    }

    return result.rows[0];
  }

  // Ganti Password
  async editPasswordAdminUser({ credentialUserId, passwordOld, passwordNew }) {
    const hashedPasswordOld = await this.getPasswordAdminUserById(
      credentialUserId
    );

    const match = await bcrypt.compare(passwordOld, hashedPasswordOld);
    if (!match) {
      throw new AuthenticationError("Password yang anda berikan salah");
    }

    const hashedPassword = await bcrypt.hash(passwordNew, 10);
    const date = new Date();
    const query = {
      text: `UPDATE user_admins SET password = $2, updated = $3, updatedby_user_id = $1 WHERE admin_id = $1`,
      values: [credentialUserId, hashedPassword, date],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
        "Gagal mengubah password, admin_user id tidak ditemukan"
      );
    }
  }

  async getPasswordAdminUserById(userId) {
    const query = {
      text: `SELECT password FROM user_admins WHERE admin_id = $1`,
      values: [userId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError(
        "Gagal mengubah password, admin_user id tidak ditemukan"
      );
    }

    return result.rows[0].password;
  }

  // Admin User
  async addAdminUser({
    fullname,
    username,
    email,
    roleId,
    credentialUserId,
  }) {
    await this.verifyNewUsernameOrEmailAdminUser(username);
    await this.verifyNewUsernameOrEmailAdminUser(email);

    const id = `admin-${nanoid(8)}`;
    const hashedPassword = await bcrypt.hash(process.env.PASSWORD_DEFAULT, 10);
    const date = new Date();
    const status = true;

    const query = {
      text: `INSERT INTO user_admins VALUES($1, $2, $3, $4, $5
            , $6, $7, $6, $7, $8, $9) RETURNING admin_id`,
      values: [
        id,
        fullname,
        username,
        email,
        hashedPassword,
        date,
        credentialUserId,
        status,
        roleId
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Register gagal!");
    }

    const adminId = result.rows[0].admin_id;

    return adminId;
  }

  async verifyNewUsernameOrEmailAdminUser(parameter) {
    const regexEmail = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
    const type = regexEmail.test(parameter) === true ? "email" : "username";

    const query = {
      text: `SELECT admin_id FROM user_admins WHERE ${type} = $1`,
      values: [parameter],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError(
        `Gagal menambahkan user, ${type} sudah digunakan`
      );
    }
  }
  // End

  // Edit user
  async editAdminUserById({ credentialUserId, userId, fullname }) {
    const date = new Date();
    const query = {
      text:
        "UPDATE user_admins SET fullname = $2, updated = $3, updatedby_user_id = $4 WHERE admin_id = $1",
      values: [userId, fullname, date, credentialUserId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount)
      throw new InvariantError(
        "Gagal edit admin user, user id tidak ditemukan"
      );
  }

  async verifyNewEmailAdminUserForUpdate(userId, email) {
    const query = {
      text: `SELECT admin_id FROM user_admins WHERE email = $1 AND admin_id != $2`,
      values: [email, userId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount)
      throw new InvariantError(
        `Gagal merubah data user, email sudah digunakan`
      );
  }

  // Edit Status User
  async editStatusAdminUserById({ credentialUserId, userId, status }) {
    const date = new Date();
    const query = {
      text:
        "UPDATE user_admins SET status = $1, updated = $2, updatedby_user_id = $3 WHERE admin_id = $4",
      values: [status, date, credentialUserId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount)
      throw new InvariantError(
        "Gagal edit status admin user, user id tidak ditemukan"
      );
  }

  // Update role authorization user admin
  async editRoleAdminUserById({ credentialUserId, userId, roleId }) {
    const date = new Date();
    const query = {
      text:
        `UPDATE user_admins SET role_id = $1, updated = $2, 
        updatedby_user_id = $3 WHERE admin_id = $4
        RETURNING admin_id`,
      values: [roleId, date, credentialUserId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount)
      throw new InvariantError(
        "Gagal edit role admin user"
      );
  }

  async resetPassword({ credentialUserId, userId }) {
    const date = new Date();
    const hashedPassword = await bcrypt.hash(process.env.PASSWORD_DEFAULT, 10);

    const query = {
      text:
        "UPDATE user_admins SET password = $1, updated = $2, updatedby_user_id = $3 WHERE admin_id = $4",
      values: [hashedPassword, date, credentialUserId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount)
      throw new InvariantError(
        "Gagal reset password admin user, user id tidak ditemukan"
      );
  }
}

module.exports = UsersService;
