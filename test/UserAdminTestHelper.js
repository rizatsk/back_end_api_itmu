const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");

class UserAdminTestHelper {
  constructor(pool_test) {
    this._pool = pool_test;
  }

  async addUserAdmin(data = {}) {
    const id = `admin-${nanoid(8)}`;
    const fullname = "Admin Service";
    const username = "admin_service";
    const email = data.email || "adminservice@gmail.com";
    const hashedPassword = await bcrypt.hash(
      data.password || "AdminItindo123",
      10
    );
    const status = true;
    const roleId = data.roleId;
    const credentialUserId = 'admin-00000001';

    const query = {
      text: `INSERT INTO user_admins VALUES($1, $2, $3, $4, $5
            , $6, $7, $6, $7, $8, $9) RETURNING admin_id`,
      values: [
        id,
        fullname,
        username,
        email,
        hashedPassword,
        new Date(),
        credentialUserId,
        status,
        roleId
      ],
    };

    const result = await this._pool.query(query);
    const adminId = result.rows[0].admin_id;

    return adminId;
  }

  async deleteUserAdmin() {
    const query = {
      text: "DELETE FROM user_admins WHERE admin_id NOT IN ('admin-00000001', 'admin-00000002')",
    };

    await this._pool.query(query);
  }

  async resetPassword() {
    const hashedPassword = await bcrypt.hash("Gaeng123", 10);
    const query = {
      text: 'UPDATE user_admins SET password = $1',
      values: [hashedPassword]
    };

    await this._pool.query(query);
  }
}

module.exports = UserAdminTestHelper;
