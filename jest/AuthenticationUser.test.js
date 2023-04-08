const pool_test = require("../databaseTest");
const app = require("../src/app");
const AuthenticationTestHelper = require("../test/AuthenticationTestHelper");
const UserItindoTestHelper = require("../test/UserItindoTestHelper");

describe("/authentications endpoint", () => {
  const authenticationTestHelper = new AuthenticationTestHelper(pool_test);
  const userItindoTestHelper = new UserItindoTestHelper(pool_test);

  // afterAll(async () => {
  // });

  afterEach(async () => {
    await userItindoTestHelper.deleteUserItindo();
  });

  describe("when POST /authentication", () => {
    it("should response 201 and new authentication", async () => {
      const server = await app(pool_test);
      const data = {
        email: "udin@gmail.com",
        password: "udil@123.com",
      };
      //   Create user
      await userItindoTestHelper.addUserItindo(data);

      const response = await server.inject({
        method: "POST",
        url: "/api/authentication",
        payload: data,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.accessToken).toBeDefined();
      expect(responseJson.data.refreshToken).toBeDefined();
    });

    it("should response 401 email or password wrong", async () => {
      const server = await app(pool_test);
      const data = {
        email: "udin@gmail.com",
        password: "udil@123.com",
      };

      const response = await server.inject({
        method: "POST",
        url: "/api/authentication",
        payload: data,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("Email atau password anda salah");
    });

    it("should response 400 bad request", async () => {
      const server = await app(pool_test);
      const data = {
        email: "",
        password: "udil@123.com",
      };

      const response = await server.inject({
        method: "POST",
        url: "/api/authentication",
        payload: data,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
    });
  });

  describe("WHEN PUT /authentication", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);
      // create user
      const userId = await userItindoTestHelper.addUserItindo();

      // generate refresh token
      const refreshToken = await authenticationTestHelper.addTokenUser({
        id: userId,
      });

      const response = await server.inject({
        method: "PUT",
        url: "/api/authentication",
        payload: {
          refreshToken,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.accessToken).toBeDefined();
    });

    it("should response 401 refresh token is invalid", async () => {
      const server = await app(pool_test);

      const response = await server.inject({
        method: "PUT",
        url: "/api/authentication",
        payload: {
          refreshToken: "acscaqsfd234124wdasd134123123sdsa",
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual("fail");
    });

    it("should response 400 bad request refersh token is required", async () => {
      const server = await app(pool_test);

      const response = await server.inject({
        method: "PUT",
        url: "/api/authentication",
        payload: {
          refreshToken: "",
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
    });
  });

  describe("WHEN DELETE /authentication", () => {
    it("should response 200 delete authentication", async () => {
      const server = await app(pool_test);
      // create user
      const userId = await userItindoTestHelper.addUserItindo();

      // generate refresh token
      const refreshToken = await authenticationTestHelper.addTokenUser({
        id: userId,
      });

      // Delete authentication
      const requestPayload = {
        refreshToken,
      };
      const response = await server.inject({
        method: "DELETE",
        url: "/api/authentication",
        payload: requestPayload,
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });

    it("should response 401 refresh token is invalid", async () => {
      const server = await app(pool_test);

      // Delete authentication
      const requestPayload = {
        refreshToken: "acscaqsfd234124wdasd134123123sdsa",
      };
      const response = await server.inject({
        method: "DELETE",
        url: "/api/authentication",
        payload: requestPayload,
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual("fail");
    });

    it("should response 400 bad request refersh token is required", async () => {
      const server = await app(pool_test);

      // Delete authentication
      const requestPayload = {
        refreshToken: "",
      };

      const response = await server.inject({
        method: "DELETE",
        url: "/api/authentication",
        payload: requestPayload,
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
    });
  });
});
