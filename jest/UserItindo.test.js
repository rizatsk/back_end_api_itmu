const pool_test = require("../databaseTest");
const app = require("../src/app");
const AuthenticationTestHelper = require("../test/AuthenticationTestHelper");
const UserItindoTestHelper = require("../test/UserItindoTestHelper");

describe("/users ITindo endpoint", () => {
  const authenticationTestHelper = new AuthenticationTestHelper(pool_test);
  const userItindoTestHelper = new UserItindoTestHelper(pool_test);

  afterAll(async () => {
    await userItindoTestHelper.deleteUserItindo();
  });

  afterEach(async () => {
    await authenticationTestHelper.deleteAuthentication();
  });

  describe("when POST /user", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);

      const data = {
        fullname: "Bambang Sutejo",
        noHandphone: "087782987067",
        email: "bambang@gmail.com",
        password: "Bambangasalole123.-",
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

    it("should response 400 No Handphone is not valid", async () => {
      const server = await app(pool_test);

      const data = {
        fullname: "Bambang Sutejo",
        noHandphone: "12345",
        email: "bambang@gmail.com",
        password: "Bambangasalole123.-",
      };

      const response = await server.inject({
        method: "POST",
        url: "/api/user",
        payload: data,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.message).toEqual("No handphone tidak valid");
    });


    it("should response 400 Password is not valid", async () => {
      const server = await app(pool_test);

      const data = {
        fullname: "Bambang Sutejo",
        noHandphone: "087782987067",
        email: "bambang@gmail.com",
        password: "Bambangasalole",
      };

      const response = await server.inject({
        method: "POST",
        url: "/api/user",
        payload: data,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.message).toEqual("Password tidak valid minimal 8 character, 1 huruf besar, 1 angka, dan 1 character khusus");
    });

    it("should response 400 payload is not valid", async () => {
      const server = await app(pool_test);

      const data = {
        fullname: "Bambang Sutejo",
        noHandphone: "087782987067",
        email: "bambang@gmail.com",
      };

      const response = await server.inject({
        method: "POST",
        url: "/api/user",
        payload: data,
      });

      // Assert
      expect(response.statusCode).toEqual(400);
    });
  });

  describe("when GET /user/id", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);

      const userId = await userItindoTestHelper.addUserItindo();
      const accessToken = authenticationTestHelper.getAccessTokenUser(userId);

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

    it("should response 404 unauthorized", async () => {
      const server = await app(pool_test);

      const accessToken = authenticationTestHelper.getAccessTokenUser('user-jokotingkir');
      const response = await server.inject({
        method: "GET",
        url: "/api/user/data",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual("User tidak ditemukan");
    });

    it("should response 401 unauthorized", async () => {
      const server = await app(pool_test);

      const response = await server.inject({
        method: "GET",
        url: "/api/user/data",
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItRW1tS1RtcHQiLCJpYXQiOjE2ODA0MjI5NzV9.FKL94TLnGj5uYGam-50Czu_udJlN54KS3ZFXKXN8x8s`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual("Unauthorized");
    });
  });
});
