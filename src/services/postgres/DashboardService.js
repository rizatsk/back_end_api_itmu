const { mapRoleUserAdminsDonuts, mapRequestServiceLine, mapStatusRequestServiceBar } = require("../../utils/MappingResultDB");

class DashboardService {
    constructor({ pool }) {
        this._pool = pool;
    }

    async getAmountDataForDashboard() {
        const resultUsers = await this._pool.query({ text: 'SELECT count(*) AS amount_users FROM users' });
        const resultUserAdmins = await this._pool.query({ text: 'SELECT count(*) AS amount_users_admin FROM user_admins' });
        const resultProducts = await this._pool.query({ text: 'SELECT count(*) AS amount_products FROM products' });
        const resultProductServices = await this._pool.query({ text: 'SELECT count(*) AS amount_product_services FROM product_services' });

        const amountUsers = resultUsers.rows[0].amount_users;
        const amountUserAdmins = resultUserAdmins.rows[0].amount_users_admin;
        const amountProducts = resultProducts.rows[0].amount_products;
        const amountProductServices = resultProductServices.rows[0].amount_product_services;

        return { amountUsers, amountUserAdmins, amountProducts, amountProductServices };
    }

    async getRequestServiceLine() {
        const query = {
            text: `SELECT device, brand, EXTRACT(MONTH FROM created_at) AS month, COUNT(*) AS amount
                    FROM request_services
                    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
                    GROUP BY month, device, brand`,
        };

        const result = await this._pool.query(query);
        const data = mapRequestServiceLine(result.rows);
        return data;
    }

    async getRoleUserAdminsDonuts() {
        const query = {
            text: `SELECT role.role_name, user_role.mount FROM
                (SELECT role_name FROM auth_role) AS role
                LEFT JOIN
                (SELECT role_name, count(*) AS mount FROM auth_role
                JOIN user_admins
                ON user_admins.role_id = auth_role.role_id
                GROUP BY role_name) AS user_role
                ON role.role_name = user_role.role_name`
        };

        const result = await this._pool.query(query);
        const data = mapRoleUserAdminsDonuts(result.rows);
        return data;
    }

    async getStatusRequestServiceBar() {
        const query = {
            text: `SELECT status, count(*) AS mount
                FROM request_services
                WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
                GROUP BY status`
        };

        const result = await this._pool.query(query);
        const data = mapStatusRequestServiceBar(result.rows);
        return data;
    }
}

module.exports = DashboardService;