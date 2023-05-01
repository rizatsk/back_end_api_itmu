const AuthorizationError = require("../../exceptions/AuthorizationError");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class AuthorizationService {
  constructor({ pool }) {
    this._pool = pool;
  }

  async getAccessRoleUser(userId) {
    const query = {
      text: `SELECT access_role FROM user_admins
            JOIN auth_role ON
            user_admins.role_id = auth_role.role_id
            WHERE admin_id = $1`,
      values: [userId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async checkRoleUser(userId, access) {
    const { access_role } = await this.getAccessRoleUser(userId);
    if (!access_role.includes(access) && access_role[0] !== "super_admin") {
      throw new AuthorizationError("You don't have access");
    }
  }

  async getCountRoleUsers(search) {
    search = search ? `%${search.toLowerCase()}%` : '%%';
    const query = {
      text: "SELECT count(*) AS count FROM auth_role WHERE LOWER(role_name) LIKE $1 AND role_id != 9999",
      values: [search]
    };

    const result = await this._pool.query(query);
    return result.rows[0].count;
  }

  async getRoleUsers({ limit, offset, search }) {
    search = search ? `%${search.toLowerCase()}%` : '%%';
    const query = {
      text: `SELECT role_id, role_name, created FROM auth_role WHERE LOWER(role_name) LIKE $3 
        AND role_id != 9999
        ORDER BY created DESC LIMIT $1 OFFSET $2`,
      values: [limit, offset, search],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async addRoleUser({ name, accessRole, userId }) {
    await this.checkNameRoleUser(name);
    const roleId = Math.floor(Math.random() * 9000) + 1000;

    const query = {
      text: `INSERT INTO auth_role(role_id, role_name, access_role, created, 
        createdby_user_id, updated, updatedby_user_id)
        VALUES($1, $2, $3, $4, $5, $4, $5) RETURNING role_id`,
      values: [roleId, name, accessRole, new Date(), userId]
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new InvariantError('Gagal insert access role');
  }

  async checkNameRoleUser(name) {
    const query = {
      text: "SELECT role_id FROM auth_role WHERE role_name = $1",
      values: [name]
    };

    const result = await this._pool.query(query);
    if (result.rowCount) throw new InvariantError('Access role name sudah tersedia');
  }

  async getRoleUserById(id) {
    const query = {
      text: "SELECT role_id, role_name, access_role FROM auth_role WHERE role_id = $1",
      values: [id]
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Access role tidak ditemukan');
    return result.rows[0];
  }

  async updateRoleUser({ roleId, name, accessRole, userId }) {
    if (roleId === 9999) throw new InvariantError('Super admin tidak dirubah');
    await this.checkNameRoleUserForUpdate(roleId, name);

    const query = {
      text: "UPDATE auth_role SET role_name = $2, access_role = $3, updated = $4, updatedby_user_id = $5 WHERE role_id = $1 RETURNING role_id",
      values: [roleId, name, accessRole, new Date(), userId]
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Gagal update access role');
  }

  async checkNameRoleUserForUpdate(roleId, roleName) {
    const query = {
      text: "SELECT role_id FROM auth_role WHERE role_id != $1 AND role_name = $2",
      values: [roleId, roleName]
    };

    const result = await this._pool.query(query);
    if (result.rowCount) throw new InvariantError('Access role name sudah tersedia');
  }

  async deleteRoleUserById(roleId) {
    if (roleId === 9999) throw new InvariantError('Super admin tidak dirubah');

    await this.checkDeleteRoleUser(roleId);
    const query = {
      text: "DELETE FROM auth_role WHERE role_id = $1",
      values: [roleId]
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Gagal menghapus access role, role id tidak ditemukan');
  }

  async checkDeleteRoleUser(roleId) {
    const query = {
      text: "SELECT admin_id FROM user_admins WHERE role_id = $1",
      values: [roleId]
    };

    const result = await this._pool.query(query);
    if (result.rowCount) throw new InvariantError('Gagal menghapus access role, role id digunakan oleh user admin');
  }
}

module.exports = AuthorizationService;
