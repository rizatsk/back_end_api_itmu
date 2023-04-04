const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class UserItindoService {
  constructor({ pool }) {
    this._pool = pool;
  }

  // Admin User
  async addUser({ fullname, email, noHandphone, password }) {
    try {
      await this.verifyNewEmail(email);
      await this.verifyNewNoHandphone(noHandphone);

      const id = `user-${nanoid(8)}`;
      const hashedPassword = await bcrypt.hash(password, 10);
      const status = true;

      const query = {
        text: `INSERT INTO users(user_id, fullname, email, no_handphone, password, status) VALUES($1, $2, $3, $4, $5
            , $6) RETURNING user_id`,
        values: [id, fullname, email, noHandphone, hashedPassword, status],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new InvariantError("Register gagal!");
      }

      const userId = result.rows[0].user_id;

      return userId;
    } catch (error) {
      console.log(error);
      throw new InvariantError("error guys");
    }
  }

  async verifyNewNoHandphone(noHandphone) {
    const query = {
      text: "SELECT user_id FROM users WHERE no_handphone = $1",
      values: [noHandphone],
    };

    const result = await this._pool.query(query);
    if (result.rowCount > 0)
      throw new InvariantError("No handphone sudah terdaftar");
  }

  async verifyNewEmail(email) {
    const query = {
      text: "SELECT user_id FROM users WHERE email = $1",
      values: [email],
    };

    const result = await this._pool.query(query);
    if (result.rowCount > 0) throw new InvariantError("Email sudah terdaftar");
  }

  async getUserById(userId) {
    const query = {
      text: 'SELECT user_id, fullname, email, no_handphone FROM users WHERE user_id = $1',
      values: [userId]
    };

    const result = await this._pool.query(query);
    if (result.rowCount < 1) throw new NotFoundError('User tidak ditemukan');

    return result.rows[0]
  }
}

module.exports = UserItindoService;
