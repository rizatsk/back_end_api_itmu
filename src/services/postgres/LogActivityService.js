const InvariantError = require("../../exceptions/InvariantError");
const getDateTime = require("../../utils/getDateTime");

class LogActivityService {
  constructor({ pool }) {
    this._pool = pool;
  }

  async postLogActivity({ credentialUserId, activity, refersId }) {
    const date = new Date();
    const query = {
      text:
        "INSERT INTO log_activities VALUES($1, $2, $3, $4) RETURNING createdby_user_id",
      values: [credentialUserId, date, activity, refersId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError("Gagal menginput log activity");
    }
  }
}

module.exports = LogActivityService;
