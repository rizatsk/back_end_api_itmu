const InvariantError = require("../../exceptions/InvariantError");
const LoginAttemptsError = require("../../exceptions/LoginAttemptsError");
const countDownMinutes = require("../../utils/countDownMinutes");

class FailedAuthenticationService {
    constructor({ pool }) {
        this._pool = pool;
    }

    async addFailedAuth(ip) {
        const { status, many_test } = await this.checkHaveFailedAuth(ip);

        if (status === 'insert') {
            const query = {
                text: "INSERT INTO failed_authentications VALUES($1, $2)",
                values: [ip, 1],
            };

            await this._pool.query(query);
        } else {
            this.updateFailedAuth(ip);
            if (many_test == 2) {
                throw new LoginAttemptsError({
                    data: {
                        minutes: 5,
                        second: 0
                    },
                    message: `Gagal melakukan login selama 3x tunggu 5 menit untuk mencoba login lagi`
                });
            }
            if (many_test == 4) {
                throw new LoginAttemptsError({
                    data: {
                        minutes: 15,
                        second: 0
                    },
                    message: `Gagal melakukan login selama 5x tunggu 15 menit untuk mencoba login lagi`
                });
            }
            if (many_test >= 6) {
                throw new LoginAttemptsError({
                    data: {
                        minutes: 60,
                        second: 0
                    },
                    message: `Gagal melakukan login selama 7x tunggu 60 menit untuk mencoba login lagi`
                });
            }
        }

        return ip;
    }

    async checkHaveFailedAuth(ip) {
        const query = {
            text: "SELECT many_test, updated_at FROM failed_authentications WHERE ip = $1",
            values: [ip]
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) return { status: 'insert', many_test: 0 };

        return { status: 'update', many_test: result.rows[0].many_test };
    }

    async checkFailedAuth(ip) {
        const query = {
            text: "SELECT many_test, updated_at FROM failed_authentications WHERE ip = $1",
            values: [ip]
        };

        const result = await this._pool.query(query);
        if (result.rowCount) {
            let minutes, second, status;
            switch (result.rows[0].many_test) {
                case 3:
                    const data3 = countDownMinutes(result.rows[0].updated_at, 3);
                    minutes = data3.minutes;
                    second = data3.second;
                    status = data3.status;
                    if (!status) {
                        throw new LoginAttemptsError({
                            data: {
                                minutes,
                                second
                            },
                            message: `Gagal melakukan login selama 3x tunggu ${minutes} menit ${second} detik untuk mencoba login lagi`
                        });
                    }
                    break;

                case 5:
                    const data5 = countDownMinutes(result.rows[0].updated_at, 15);
                    minutes = data5.minutes;
                    second = data5.second;
                    status = data5.status;
                    if (!status) {
                        throw new LoginAttemptsError({
                            data: {
                                minutes,
                                second
                            },
                            message: `Gagal melakukan login selama 5x tunggu ${minutes} menit ${second} detik untuk mencoba login lagi`
                        });
                    }
                    break;

                default:
                    if (result.rows[0].many_test >= 7) {
                        const data7 = countDownMinutes(result.rows[0].updated_at, 60);
                        minutes = data7.minutes;
                        second = data7.second;
                        status = data7.status;
                        if (!status) {
                            throw new LoginAttemptsError({
                                data: {
                                    minutes,
                                    second
                                },
                                message: `Gagal melakukan login selama 7x tunggu ${minutes} menit ${second} detik untuk mencoba login lagi`
                            });
                        }

                        this.deleteUpdateFailedAuth(ip);
                    }
                    break;
            }
        }
    }

    async updateFailedAuth(ip) {
        const query = {
            text: "UPDATE failed_authentications SET many_test = many_test + 1, updated_at = $2 WHERE ip = $1",
            values: [ip, new Date()]
        };

        await this._pool.query(query);

        return ip;
    }

    async deleteUpdateFailedAuth(ip) {
        const query = {
            text: "DELETE FROM failed_authentications WHERE ip = $1",
            values: [ip]
        };

        await this._pool.query(query);

        return ip;
    }
}

module.exports = FailedAuthenticationService;