const InvariantError = require("../../exceptions/InvariantError");

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
      throw new InvariantError("you don't have access");
    }
  }
}

module.exports = AuthorizationService;
