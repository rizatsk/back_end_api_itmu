const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");

class UserItindoTestHelper {
  constructor(pool_test) {
    this._pool = pool_test;
  }

  async addUserItindo(data = {}) {
    const id = `user-${nanoid(8)}`;
    const fullname = "Jokowi JKT48";
    const email = data.email || "jamaludin@gmail.com";
    const noHandphone = "081231412123";
    const hashedPassword = await bcrypt.hash(
      data.password || "Jokowihorehore",
      10
    );
    const status = true;

    const query = {
      text: `INSERT INTO users(user_id, fullname, email, no_handphone, password, status) VALUES($1, $2, $3, $4, $5
            , $6) RETURNING user_id`,
      values: [id, fullname, email, noHandphone, hashedPassword, status],
    };

    const result = await this._pool.query(query);
    const userId = result.rows[0].user_id;

    return userId;
  }

  async deleteUserItindo() {
    const query = {
      text: "DELETE FROM users",
    };

    await this._pool.query(query);
  }
}

module.exports = UserItindoTestHelper;
