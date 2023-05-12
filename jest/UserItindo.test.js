const pool_test = require("../databaseTest");
const app = require("../src/app");
const AuthenticationTestHelper = require("../test/AuthenticationTestHelper");
const UserItindoTestHelper = require("../test/UserItindoTestHelper");

describe("/user ITindo endpoint", () => {
  const authenticationTestHelper = new AuthenticationTestHelper(pool_test);
  const userItindoTestHelper = new UserItindoTestHelper(pool_test);

  afterAll(async () => {
  });

  afterEach(async () => {
    await userItindoTestHelper.deleteUserItindo();
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
      expect(responseJson.message).toEqual("Registrasi anda berhasil, silahkan cek email Anda untuk konfirmasi user");
    });

    it("should response 400 email is available", async () => {
      const server = await app(pool_test);
      const email = "bambang@gmail.com"
      await userItindoTestHelper.addUserItindo({ email });

      const data = {
        fullname: "Bambang Sutejo",
        noHandphone: "0877829870678",
        email,
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
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("Email sudah terdaftar");
    });

    it("should response 400 no handphone is available", async () => {
      const server = await app(pool_test);
      await userItindoTestHelper.addUserItindo();

      const data = {
        fullname: "Bambang Sutejo",
        noHandphone: "081231412123",
        email: "bambang123@gmail.com",
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
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("No handphone sudah terdaftar");
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
      expect(responseJson.message).toEqual(
        "Password tidak valid minimal 8 character, tedapat huruf besar, tedapat angka, dan terdapat character khusus"
      );
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

  describe("when GET /user/data", () => {
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

    it("should response 404 not found", async () => {
      const server = await app(pool_test);

      const accessToken = authenticationTestHelper.getAccessTokenUser(
        "user-jokotingkir"
      );
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

  describe("when PUT data /user/data/{parameter}", () => {
    it("should response 200 update fullname", async () => {
      const server = await app(pool_test);

      const userId = await userItindoTestHelper.addUserItindo();
      const accessToken = authenticationTestHelper.getAccessTokenUser(userId);

      const data = {
        fullname: 'Bambang I love you'
      };

      const response = await server.inject({
        method: "PUT",
        url: "/api/user/data/fullname",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: data
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.message).toEqual("Berhasil merubah data fullname user");
    });

    it("should response 400 update fullname required", async () => {
      const server = await app(pool_test);

      const userId = await userItindoTestHelper.addUserItindo();
      const accessToken = authenticationTestHelper.getAccessTokenUser(userId);

      const data = {
        fullname: ''
      };

      const response = await server.inject({
        method: "PUT",
        url: "/api/user/data/fullname",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: data
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
    });

    it("should response 200 update handphone", async () => {
      const server = await app(pool_test);

      const userId = await userItindoTestHelper.addUserItindo();
      const accessToken = authenticationTestHelper.getAccessTokenUser(userId);

      const data = {
        noHandphone: '087781427523'
      };

      const response = await server.inject({
        method: "PUT",
        url: "/api/user/data/handphone",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: data
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.message).toEqual("Berhasil merubah data handphone user");
    });

    it("should response 400 update no hadphone is not valid", async () => {
      const server = await app(pool_test);

      const userId = await userItindoTestHelper.addUserItindo();
      const accessToken = authenticationTestHelper.getAccessTokenUser(userId);

      const data = {
        noHandphone: '12425123142'
      };

      const response = await server.inject({
        method: "PUT",
        url: "/api/user/data/handphone",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: data
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
    });

    it("should response 200 update address", async () => {
      const server = await app(pool_test);

      const userId = await userItindoTestHelper.addUserItindo();
      const accessToken = authenticationTestHelper.getAccessTokenUser(userId);

      const data = {
        address: {
          label: 'kantor',
          provinsi: 'DKI Jakarta',
          kota: 'Jakarta Barat',
          kecamatan: 'Kebon Jeruk',
          kelurahan: 'Kebon',
          alamat: 'Ruko Rich Palace No 3 Blok B',
        }
      };

      const response = await server.inject({
        method: "PUT",
        url: "/api/user/data/address",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: data
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.message).toEqual("Berhasil merubah data address user");
    });

    it("should response 400 update address is not valid payload", async () => {
      const server = await app(pool_test);

      const userId = await userItindoTestHelper.addUserItindo();
      const accessToken = authenticationTestHelper.getAccessTokenUser(userId);

      const data = {
        address: {
          labol: 'kantor',
          provinsi: 'DKI Jakarta',
          kota: 'Jakarta Barat',
          kecamatan: 'Kebon Jeruk',
          kelurahan: 'Kebon',
        }
      };

      const response = await server.inject({
        method: "PUT",
        url: "/api/user/data/address",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: data
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
    });

    it("should response 404 update data parameter not found", async () => {
      const server = await app(pool_test);

      const userId = await userItindoTestHelper.addUserItindo();
      const accessToken = authenticationTestHelper.getAccessTokenUser(userId);

      const data = {
        batukali: 'Tester'
      };

      const response = await server.inject({
        method: "PUT",
        url: "/api/user/data/batuKali",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: data
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("Data user yang ingin dirubah tidak ditemukan");
    });
  });

  describe("when PUT password /user/password", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);

      const userId = await userItindoTestHelper.addUserItindo();
      const accessToken = authenticationTestHelper.getAccessTokenUser(userId);

      const data = {
        passwordOld: 'Jokowihorehore',
        passwordNew: 'JokowiLoveYou123.-'
      };

      const response = await server.inject({
        method: "PUT",
        url: "/api/user/password",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: data
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.message).toEqual("Berhasil mengganti password user");
    });

    it("should response 400 password new is not valid", async () => {
      const server = await app(pool_test);

      const userId = await userItindoTestHelper.addUserItindo();
      const accessToken = authenticationTestHelper.getAccessTokenUser(userId);

      const data = {
        passwordOld: 'Jokowihorehore',
        passwordNew: 'JokowiLoveYou123'
      };

      const response = await server.inject({
        method: "PUT",
        url: "/api/user/password",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: data
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("Password tidak valid minimal 8 character, tedapat huruf besar, tedapat angka, dan terdapat character khusus");
    });

    it("should response 401", async () => {
      const server = await app(pool_test);

      const userId = await userItindoTestHelper.addUserItindo();
      const accessToken = authenticationTestHelper.getAccessTokenUser(userId);

      const data = {
        passwordOld: 'Jokowihoreshores',
        passwordNew: 'JokowiLoveYou123.-'
      };

      const response = await server.inject({
        method: "PUT",
        url: "/api/user/password",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: data
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("Password yang anda berikan salah");
    });
  });

  // For CMS
  describe("when GET /user", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);

      const userId = await userItindoTestHelper.addUserItindo();
      const accessToken = authenticationTestHelper.getAccessToken();

      const response = await server.inject({
        method: "GET",
        url: "/api/user",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.users).toBeDefined();
      expect(responseJson.totalData).toEqual(1);
      expect(responseJson.totalPage).toEqual(1);
      // console.log(responseJson)
    });

    it("should response 403 Authorization", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');

      const response = await server.inject({
        method: "GET",
        url: "/api/user",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("You don't have access");
    });
  });

  describe("when PUT /user/status/{id}", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);

      const userId = await userItindoTestHelper.addUserItindo();
      const accessToken = authenticationTestHelper.getAccessToken();

      const response = await server.inject({
        method: "PUT",
        url: `/api/user/status/${userId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: {
          status: false
        }
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.message).toEqual("Berhasil update status user");
    });

    it("should response 403 Authorization", async () => {
      const server = await app(pool_test);
      const userId = await userItindoTestHelper.addUserItindo();
      const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');

      const response = await server.inject({
        method: "PUT",
        url: `/api/user/status/${userId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: {
          status: false
        }
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("You don't have access");
    });

    it("should response 400 gagal update status user, user tidak ada", async () => {
      const server = await app(pool_test);

      // const userId = await userItindoTestHelper.addUserItindo();
      const userId = 'user-123';
      const accessToken = authenticationTestHelper.getAccessToken();

      const response = await server.inject({
        method: "PUT",
        url: `/api/user/status/${userId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: {
          status: false
        }
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("Gagal update status user");
    });

    it("should response 400 payload is not valid", async () => {
      const server = await app(pool_test);

      const userId = await userItindoTestHelper.addUserItindo();
      const accessToken = authenticationTestHelper.getAccessToken();

      const response = await server.inject({
        method: "PUT",
        url: `/api/user/status/${userId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: {
          // status: 'false'
        }
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
    });
  });
});
