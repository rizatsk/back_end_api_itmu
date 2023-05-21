const { nanoid } = require("nanoid");

class SetupServiceTestHelper {
    constructor(pool_test) {
        this._pool = pool_test;
    }

    async addSetupService() {
        const name = 'Pergantian RAM',
            detail = 'Pergantian RAM Laptop/Komputer',
            price = 50000,
            type = 'RAM';

        const id = `setup_service-${nanoid(10)}`
        const query = {
            text: `INSERT INTO setup_services(setup_service_id,
                name, detail, price, type)
                VALUES($1, $2, $3, $4, $5) RETURNING setup_service_id`,
            values: [id, name, detail, price, type]
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) throw new InvariantError('Gagal insert fee replacement')

        return result.rows[0].setup_service_id;
    }

    async deleteSetupService() {
        const query = {
            text: 'DELETE FROM setup_services'
        };

        await this._pool.query(query);
    }
}

module.exports = SetupServiceTestHelper