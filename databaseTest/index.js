const { Pool } = require("pg");
const testConfig = require("../config/test.json");

const pool_test = new Pool(testConfig);

module.exports = pool_test;
