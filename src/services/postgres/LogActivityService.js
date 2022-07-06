const {Pool} = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const getDateTime = require('../../utils/getDateTime');

class LogActivityService {
  constructor() {
    this._pool = new Pool();
  }

  async postLogActivity({credentialUserId, activity, refersId}) {
    const query = {
      text: 'INSERT INTO log_activities VALUES($1, $2, $3, $4)',
      values: [credentialUserId, getDateTime(), activity, refersId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Gagal menginput log activity');
    }
  }
}

module.exports = LogActivityService;
