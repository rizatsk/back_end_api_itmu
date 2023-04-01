const { Pool } = require("pg");
const app = require("./app");

const init = async () => {
  const pool = new Pool();
  const server = await app(pool);
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
