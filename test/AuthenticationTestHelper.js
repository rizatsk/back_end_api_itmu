const JwtIO = require("@hapi/jwt");
const { nanoid } = require("nanoid");

class AuthenticationTestHelper {
  constructor(pool_test) {
    this._pool = pool_test;
  }

  async addRefreshToken(payload) {
    const id = nanoid(16);
    const query = {
      text: "INSERT INTO authentications VALUES($1, $2, $3, $4, $5)",
      values: [
        id,
        payload.userId,
        payload.refreshToken,
        payload.ip,
        payload.device,
      ],
    };

    await this._pool.query(query);
  }

  async addToken() {
    const id = "admin-00000001";
    const refreshToken = JwtIO.token.generate(
      id,
      process.env.REFRESH_TOKEN_KEY
    );

    const payload = {
      userId: id,
      refreshToken,
      ip: "127.0.0.1",
      device: "Windows WHOAMI",
    };

    await this.addRefreshToken(payload);
    return refreshToken;
  }

  getAccessToken() {
    const id = "admin-00000001";
    return JwtIO.token.generate({ id }, process.env.ACCESS_TOKEN_KEY);
  }

  async deleteAuthentication() {
    const query = {
      text: `DELETE FROM authentications`,
    };

    await this._pool.query(query);
  }

  getAccessTokenUser(id) {
    return JwtIO.token.generate({ id }, process.env.ACCESS_TOKEN_KEY_USER)
  }
}

module.exports = AuthenticationTestHelper;
