require("dotenv").config();
const { Pool } = require("pg");

const pool_test = new Pool({
    user: process.env.PGUSER_TEST,
    password: process.env.PGPASSWORD_TEST,
    host: process.env.PGHOST_TEST,
    port: process.env.PGPORT_TEST,
    database: process.env.PGDATABASE_TEST
});

module.exports = pool_test;
