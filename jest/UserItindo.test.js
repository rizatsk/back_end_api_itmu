const pool_test = require("../databaseTest");
const app = require("../src/app");
const AuthenticationTestHelper = require("../test/AuthenticationTestHelper");
const UserItindoTestHelper = require("../test/UserItindoTestHelper");

describe("/users ITindo endpoint", () => {
  const authenticationTestHelper = new AuthenticationTestHelper(pool_test);
  const userItindoTestHelper = new UserItindoTestHelper(pool_test);

  let accessToken = "";

  afterAll(async () => {
    await userItindoTestHelper.deleteUserItindo();
  });

  //   afterEach(async () => {
  //     await authenticationTestHelper.deleteAuthentication();
  //   });

  describe("when POST /user", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);

      const data = {
        fullname: "Bambang Sutejo",
        noHandphone: "087782987067",
        email: "bambang@gmail.com",
        password: "Bambang asalole",
      };

      const response = await server.inject({
        method: "POST",
        url: "/api/user",
        payload: data,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.accessToken).toBeDefined();
      expect(responseJson.data.refreshToken).toBeDefined();
      accessToken = responseJson.data.accessToken;
    });
  });

  describe("when GET /user/id", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);

      const response = await server.inject({
        method: "GET",
        url: "/api/user/data",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });
  });
});
