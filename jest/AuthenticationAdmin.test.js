const pool_test = require("../databaseTest");
const app = require("../src/app");
const AuthenticationTestHelper = require("../test/AuthenticationTestHelper");
const LogActivityTestHelper = require("../test/LogActivityTestHelper");

describe("/authentications endpoint", () => {
  const authenticationTestHelper = new AuthenticationTestHelper(pool_test);
  const logActivityTestHelper = new LogActivityTestHelper(pool_test);

  afterAll(async () => {
    await logActivityTestHelper.deleteLogActivity();
  });

  afterEach(async () => {
    await authenticationTestHelper.deleteAuthentication();
  });

  describe("when POST /authentication/admin", () => {
    it("should response 201 and new authentication", async () => {
      const server = await app(pool_test);
      const requestPayload = {
        parameter: "itindo",
        password: "Gaeng123",
      };

      const response = await server.inject({
        method: "POST",
        url: "/api/authentications/admin",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.accessToken).toBeDefined();
      expect(responseJson.data.refreshToken).toBeDefined();
    });
  });

  describe("WHEN GET /authentication/admin", () => {
    it("should response 200 get authentication", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();

      const response = await server.inject({
        method: "GET",
        url: "/api/authentications/admin",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.user).toBeDefined();
      expect(responseJson.data.user.admin_id).toBeDefined();
    });
  });

  describe("WHEN PUT /authentications/admin", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);
      const refreshToken = await authenticationTestHelper.addToken();

      const requestPayload = {
        refreshToken,
      };

      const response = await server.inject({
        method: "PUT",
        url: "/api/authentications/admin",
        payload: requestPayload,
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
    });
  });

  describe("WHEN DELETE /authentications/admin", () => {
    it("should response 200 delete authentication", async () => {
      const server = await app(pool_test);
      const refreshToken = await authenticationTestHelper.addToken();

      // Delete authentication
      const requestPayload = {
        refreshToken,
      };
      const response = await server.inject({
        method: "DELETE",
        url: "/api/authentications/admin",
        payload: requestPayload,
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });
  });
});
