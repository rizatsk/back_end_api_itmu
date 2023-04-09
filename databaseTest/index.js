require("dotenv").config();
const { Pool } = require("pg");
const config = require("../config/test.json");

const pool_test = new Pool(config);

module.exports = pool_test;
