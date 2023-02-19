const { Pool } = require("pg");

class AuthorizationService {
  constructor() {
    this._pool = new Pool();
  }

  async getAccessRoleUser(userId) {
    const query = {
      text: `SELECT access_role FROM users
            JOIN auth_role ON
            users.role_id = auth_role.role_id
            WHERE admin_id = $1`,
      values: [userId],
    };

    const result = await this._pool.query(query);

    // return result.rows[0];
    console.log(result.rows[0]);
  }

  async checkRoleUser(roleUser, accessToken) {
    console.log(roleUser, accessToken);
  }
}

module.exports = AuthorizationService;
