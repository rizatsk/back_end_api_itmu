const Authorization = require('../config/authorization.json');

class AuthorizationTestHelper {
    constructor(pool_test) {
        this._pool = pool_test;
    }

    async addAccessRole() {
        const roleId = Math.floor(Math.random() * 9000) + 1000;
        const name = "admin_product";
        const accessRole = [Authorization.product["insert product"], Authorization.product["update product"]];
        const userId = "admin-00000001";

        const query = {
            text: `INSERT INTO auth_role(role_id, role_name, access_role, created, 
        createdby_user_id, updated, updatedby_user_id)
        VALUES($1, $2, $3, $4, $5, $4, $5) RETURNING role_id`,
            values: [roleId, name, accessRole, new Date(), userId]
        };

        const result = await this._pool.query(query);
        return result.rows[0].role_id;
    }

    async deleteAccessRole() {
        const query = {
            text: `DELETE FROM auth_role WHERE role_id NOT IN (9999, 1)`
        };

        await this._pool.query(query);
    }
}

module.exports = AuthorizationTestHelper;
