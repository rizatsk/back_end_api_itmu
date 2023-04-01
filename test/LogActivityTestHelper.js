class LogActivityTestHelper {
  constructor(pool_test) {
    this._pool = pool_test;
  }

  async deleteLogActivity() {
    const query = {
      text: "DELETE FROM log_activities",
    };

    await this._pool.query(query);
  }
}

module.exports = LogActivityTestHelper;
