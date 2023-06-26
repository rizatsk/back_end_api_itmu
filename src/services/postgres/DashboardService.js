const NotFoundError = require("../../exceptions/NotFoundError");
const { mapRoleUserAdminsDonuts, mapRequestServiceLine, mapStatusRequestServiceBar, MappingProductsForUser } = require("../../utils/MappingResultDB");
const createProfileImage = require("../../utils/createProfileImage");

class DashboardService {
    constructor({ pool, cacheService }) {
        this._pool = pool;
        this._cacheService = cacheService;
    }

    async getAmountDataForDashboard() {
        const resultUsers = await this._pool.query({ text: 'SELECT count(*) AS amount_users FROM users' });
        const resultUserAdmins = await this._pool.query({ text: 'SELECT count(*) AS amount_users_admin FROM user_admins' });
        const resultProducts = await this._pool.query({ text: 'SELECT count(*) AS amount_products FROM products' });
        const resultSetupServices = await this._pool.query({ text: 'SELECT count(*) AS amount_setup_services FROM setup_services' });

        const amountUsers = resultUsers.rows[0].amount_users;
        const amountUserAdmins = resultUserAdmins.rows[0].amount_users_admin;
        const amountProducts = resultProducts.rows[0].amount_products;
        const amountSetupServices = resultSetupServices.rows[0].amount_setup_services;

        return { amountUsers, amountUserAdmins, amountProducts, amountSetupServices };
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

    // Home Mobile
    async getDataProductForHome(userId) {
        let dataUser = {
            name: 'User ITMU',
            countService: 0,
            countServiceProcess: 0,
            countServiceDone: 0,
            profileImage: createProfileImage('User Itindo'),
        }

        if (userId) {
            dataUser = await this.getDataUserForHome(userId)
        }

        const resultProductPromo = await this._pool.query({
            text: `
            SELECT products.product_id, 
            name, price, price_promotion,
            (SELECT link FROM image_products WHERE product_id = products.product_id 
            ORDER BY created ASC LIMIT 1) AS image_link 
            FROM products WHERE status = true AND price_promotion IS NOT NULL
            LIMIT 3
        `});
        const productPromo = resultProductPromo.rows.map(MappingProductsForUser);

        const resultProductSparepart = await this._pool.query({
            text: `
            SELECT products.product_id, 
            name, price, price_promotion,
            (SELECT link FROM image_products WHERE product_id = products.product_id 
            ORDER BY created ASC LIMIT 1) AS image_link 
            FROM products WHERE status = true AND sparepart = true
            LIMIT 3
        `});
        const productSparepart = resultProductSparepart.rows.map(MappingProductsForUser);

        const imageBanner = [`${process.env.URLIMAGE}/Banner/banner-1.webp`, `${process.env.URLIMAGE}/Banner/banner-2.webp`];

        return { imageBanner, productPromo, productSparepart, dataUser }
    }

    async getDataUserForHome(userId) {
        try {
            // mendapatkan catatan dari cache
            const result = await this._cacheService.get(`userForHome:${userId}`);
            return JSON.parse(result);
        } catch (error) {
            const resultProductPromo = await this._pool.query({
                text: `
                SELECT fullname AS name, 
                (SELECT count(*) FROM request_services WHERE user_id = $1) AS countService,
                (SELECT count(*) FROM request_services WHERE user_id = $1 AND status = 'progress') AS countServiceProcess,
                (SELECT count(*) FROM request_services WHERE user_id = $1 AND status = 'done') AS countServiceDone
                FROM users WHERE user_id = $1`,
                values: [userId]
            });

            if (!resultProductPromo.rowCount) throw new NotFoundError('User tidak ada')

            const result = resultProductPromo.rows[0];
            result.profileImage = createProfileImage(result.name);

            // catatan akan disimpan pada cache sebelum fungsi getNotes dikembalikan
            await this._cacheService.set(`userForHome:${userId}`, JSON.stringify(result));

            return result;
        }
    }
}

module.exports = DashboardService;