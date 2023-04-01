const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");

class AuthenticationService {
  constructor({ pool }) {
    this._pool = pool;
  }

  async addRefreshToken({ userId, refreshToken, ip, device }) {
    const id = nanoid(16);
    let query;

    const resultCondition = await this.checkAddRefreshToken({
      userId,
      ip,
      device,
    });

    if (resultCondition === "insert") {
      query = {
        text: "INSERT INTO authentications VALUES($1, $2, $3, $4, $5)",
        values: [id, userId, refreshToken, ip, device],
      };
    } else {
      query = {
        text: `UPDATE authentications SET token = $1 WHERE id = $2`,
        values: [refreshToken, resultCondition],
      };
    }

    await this._pool.query(query);
  }

  async checkAddRefreshToken(data) {
    const query = {
      text: `SELECT id FROM authentications WHERE user_id = $1
            AND ip = $2 AND device = $3`,
      values: [data.userId, data.ip, data.device],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return "insert";
    }

    return result.rows[0].id;
  }

  async verifyRefreshToken(token) {
    const query = {
      text: "SELECT user_id, token FROM authentications WHERE token = $1",
      values: [token],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Refresh token tidak valid");
    }

    return result.rows[0].user_id;
  }

  async deleteRefreshToken(token) {
    const query = {
      text: "DELETE FROM authentications WHERE token = $1",
      values: [token],
    };

    await this._pool.query(query);
  }

  async deleteRefreshTokenByUserId(userId) {
    const query = {
      text: "DELETE FROM authentications WHERE user_id = $1",
      values: [userId],
    };

    await this._pool.query(query);
  }
}

module.exports = AuthenticationService;
