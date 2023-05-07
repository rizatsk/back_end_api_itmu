const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class UserItindoService {
  constructor({ pool }) {
    this._pool = pool;
  }

  // Admin User
  async addUser({ fullname, email, noHandphone, password }) {
    await this.verifyNewEmail(email);
    await this.verifyNewNoHandphone(noHandphone);

    const id = `user-${nanoid(8)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const status = true;

    const query = {
      text: `INSERT INTO users(user_id, address, fullname, email, no_handphone, password, status) VALUES($1, $2, $3, $4, $5
            , $6, $7) RETURNING user_id`,
      values: [id, {}, fullname, email, noHandphone, hashedPassword, status],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Register gagal!");
    }

    const userId = result.rows[0].user_id;

    return userId;
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

  async verifyUserCredential({ email, password }) {
    const query = {
      text: `SELECT user_id, password, status FROM users WHERE email = $1`,
      values: [email],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthenticationError(`Email atau password anda salah`);
    }

    const {
      user_id: userId,
      password: hashedPassword,
      status,
    } = result.rows[0];
    if (status === false) {
      throw new AuthenticationError("User tidak aktif");
    }

    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      throw new AuthenticationError("Email atau password anda salah");
    }

    return { userId };
  }

  async getUserById(userId) {
    const query = {
      text:
        "SELECT user_id, fullname, address, email, no_handphone FROM users WHERE user_id = $1",
      values: [userId],
    };

    const result = await this._pool.query(query);
    if (result.rowCount < 1) throw new NotFoundError("User tidak ditemukan");

    return result.rows[0];
  }

  async changeDataUserById({ user_id, fullname, no_handphone, address }) {
    try {
      const query = {
        text:
          "UPDATE users SET fullname = $2, no_handphone = $3, address = $4 WHERE user_id = $1 RETURNING user_id",
        values: [user_id, fullname, no_handphone, address],
      };

      const result = await this._pool.query(query);
      if (!result.rowCount) throw new NotFoundError("User tidak ditemukan");
    } catch (error) {
      console.log(error);
      throw new InvariantError("Server error");
    }
  }

  // Ganti Password
  async editPasswordUser({ userId, passwordOld, passwordNew }) {
    const hashedPasswordOld = await this.getPasswordUserById(userId);

    const match = await bcrypt.compare(passwordOld, hashedPasswordOld);
    if (!match) {
      throw new AuthenticationError("Password yang anda berikan salah");
    }

    const hashedPassword = await bcrypt.hash(passwordNew, 10);
    const date = new Date();
    const query = {
      text: `UPDATE users SET password = $2, updated_at = $3 WHERE user_id = $1`,
      values: [userId, hashedPassword, date],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
        "Gagal mengubah password, user id tidak ditemukan"
      );
    }
  }

  async getPasswordUserById(userId) {
    const query = {
      text: `SELECT password FROM users WHERE user_id = $1`,
      values: [userId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError(
        "Gagal mengubah password, user id tidak ditemukan"
      );
    }

    return result.rows[0].password;
  }

  // Get user admin
  async getCountUsers(search) {
    search = search ? `%${search.toLowerCase()}%` : "%%";
    const query = {
      text: "SELECT count(*) AS count FROM users WHERE LOWER(email) LIKE $1",
      values: [search],
    };

    const result = await this._pool.query(query);
    return result.rows[0].count;
  }

  async getUsers({ limit, offset, search }) {
    search = search ? `%${search.toLowerCase()}%` : "%%";
    const query = {
      text: `SELECT user_id, fullname,
        email, no_handphone, address, status,
        created_at, updated_at
        FROM users
        WHERE LOWER(email) LIKE $3
        ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      values: [limit, offset, search],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async updateStatusUserById({ userId, status }) {
    const query = {
      text: `UPDATE users SET status = $2
        WHERE user_id = $1`,
      values: [userId, status],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError("Gagal update status user");
  }
}

module.exports = UserItindoService;
