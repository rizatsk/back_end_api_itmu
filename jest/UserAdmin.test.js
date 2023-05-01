const pool_test = require("../databaseTest");
const app = require("../src/app");
const AuthenticationTestHelper = require("../test/AuthenticationTestHelper");
const AuthorizationTestHelper = require("../test/AuthorizationTestHelper");
const LogActivityTestHelper = require("../test/LogActivityTestHelper");
const UserAdminTestHelper = require("../test/UserAdminTestHelper");

describe("/user/admin User Admin endpoint", () => {
    const userAdminTestHelper = new UserAdminTestHelper(pool_test);
    const logActivityTestHelper = new LogActivityTestHelper(pool_test);
    const authorizationTestHelper = new AuthorizationTestHelper(pool_test);
    const authenticationTestHelper = new AuthenticationTestHelper(pool_test);

    afterAll(async () => {
        await logActivityTestHelper.deleteLogActivity();
    });

    afterEach(async () => {
        await userAdminTestHelper.resetPassword();
        await userAdminTestHelper.deleteUserAdmin();
        await authorizationTestHelper.deleteAccessRole();
        await authenticationTestHelper.deleteAuthentication();
    });


    // Admin merubah data admin lain
    describe("when POST /user/admin", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const roleId = await authorizationTestHelper.addAccessRole();

            const data = {
                fullname: "Bambang Sutejo",
                username: "bambangsutejo77",
                email: "bambang@gmail.com",
                roleId: `${roleId}`,
            };

            const response = await server.inject({
                method: "POST",
                url: "/api/user/admin",
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.message).toEqual("User admin berhasil didaftarkan");
        });

        it("should response 400 payload is required", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const roleId = await authorizationTestHelper.addAccessRole();

            const data = {
                fullname: "Bambang Sutejo",
                username: "bambangsutejo77",
                roleId: `${roleId}`,
            };

            const response = await server.inject({
                method: "POST",
                url: "/api/user/admin",
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
        });

        it("should response 400 email is available", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const roleId = await authorizationTestHelper.addAccessRole();
            await userAdminTestHelper.addUserAdmin({ roleId })

            const data = {
                fullname: "Bambang Sutejo",
                username: "bambangsutejo77",
                email: "adminservice@gmail.com",
                roleId: `${roleId}`,
            };

            const response = await server.inject({
                method: "POST",
                url: "/api/user/admin",
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
        });

        it("should response 403 Authorization", async () => {
            const server = await app(pool_test);
            const roleId = await authorizationTestHelper.addAccessRole();
            const adminId = await userAdminTestHelper.addUserAdmin({ roleId })
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser(adminId);

            const data = {
                fullname: "Bambang Sutejo",
                username: "bambangsutejo77",
                email: "bambang@gmail.com",
                roleId: `${roleId}`,
            };

            const response = await server.inject({
                method: "POST",
                url: "/api/user/admin",
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(403);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("You don't have access");
        });
    });

    describe("when GET /user/admin", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();

            const response = await server.inject({
                method: "GET",
                url: "/api/user/admin",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.usersAdmin).toBeDefined();
            expect(responseJson.totalData).toEqual(1);
            expect(responseJson.totalPage).toEqual(1);
            // console.log(responseJson)
        });

        it("should response 403 Authorization", async () => {
            const server = await app(pool_test);
            const roleId = await authorizationTestHelper.addAccessRole();
            const adminId = await userAdminTestHelper.addUserAdmin({ roleId })
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser(adminId);

            const response = await server.inject({
                method: "GET",
                url: "/api/user/admin",
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

    describe("when GET /user/admin/{id}", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const roleId = await authorizationTestHelper.addAccessRole();
            const accessToken = authenticationTestHelper.getAccessToken();
            const userId = await userAdminTestHelper.addUserAdmin({ roleId });

            const response = await server.inject({
                method: "GET",
                url: `/api/user/admin/${userId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.userAdmin).toBeDefined();
            expect(responseJson.data.userAdmin.admin_id).toBeDefined();
            expect(responseJson.data.userAdmin.email).toBeDefined();
            // console.log(responseJson)
        });

        it("should response 404", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const userId = 'user-123';

            const response = await server.inject({
                method: "GET",
                url: `/api/user/admin/${userId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Admin user tidak ada");
        });

        it("should response 403 Authorization", async () => {
            const server = await app(pool_test);
            const roleId = await authorizationTestHelper.addAccessRole();
            const adminId = await userAdminTestHelper.addUserAdmin({ roleId })
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser(adminId);

            const response = await server.inject({
                method: "GET",
                url: `/api/user/admin/${adminId}`,
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

    describe("when PUT /user/admin/status/{id}", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const roleId = await authorizationTestHelper.addAccessRole();
            const accessToken = authenticationTestHelper.getAccessToken();
            const userId = await userAdminTestHelper.addUserAdmin({ roleId });
            const data = {
                status: false
            }

            const response = await server.inject({
                method: "PUT",
                url: `/api/user/admin/status/${userId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.message).toEqual("Status admin user berhasil di update");
        });

        it("should response 400", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const userId = 'user-123';
            const data = {
                status: false
            }

            const response = await server.inject({
                method: "PUT",
                url: `/api/user/admin/status/${userId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Gagal edit status admin user, user id tidak ditemukan");
        });

        it("should response 403 Authorization", async () => {
            const server = await app(pool_test);
            const roleId = await authorizationTestHelper.addAccessRole();
            const adminId = await userAdminTestHelper.addUserAdmin({ roleId })
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser(adminId);
            const data = {
                status: false
            }

            const response = await server.inject({
                method: "PUT",
                url: `/api/user/admin/status/${adminId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(403);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("You don't have access");
        });
    });

    describe("when PUT /user/admin/role/{id}", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const roleId = await authorizationTestHelper.addAccessRole();
            const accessToken = authenticationTestHelper.getAccessToken();
            const userId = await userAdminTestHelper.addUserAdmin({ roleId });
            const data = {
                roleId
            }

            const response = await server.inject({
                method: "PUT",
                url: `/api/user/admin/role/${userId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.message).toEqual("Berhasil merubah role admin");
        });

        it("should response 400 request payload is not valid", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const userId = 'user-123';
            const data = {
                roleId: ''
            }

            const response = await server.inject({
                method: "PUT",
                url: `/api/user/admin/role/${userId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
        });

        it("should response 403 Authorization", async () => {
            const server = await app(pool_test);
            const roleId = await authorizationTestHelper.addAccessRole();
            const adminId = await userAdminTestHelper.addUserAdmin({ roleId })
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser(adminId);
            const data = {
                roleId
            }

            const response = await server.inject({
                method: "PUT",
                url: `/api/user/admin/role/${adminId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(403);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("You don't have access");
        });
    });

    describe("when PUT /user/admin/password/{id}", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const roleId = await authorizationTestHelper.addAccessRole();
            const accessToken = authenticationTestHelper.getAccessToken();
            const userId = await userAdminTestHelper.addUserAdmin({ roleId });

            const response = await server.inject({
                method: "PUT",
                url: `/api/user/admin/password/${userId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.message).toEqual("Password admin user berhasil direset");
        });

        it("should response 400 request payload is not valid", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const userId = 'user-123';

            const response = await server.inject({
                method: "PUT",
                url: `/api/user/admin/password/${userId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Gagal reset password admin user, user id tidak ditemukan");
        });

        it("should response 403 Authorization", async () => {
            const server = await app(pool_test);
            const roleId = await authorizationTestHelper.addAccessRole();
            const adminId = await userAdminTestHelper.addUserAdmin({ roleId })
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser(adminId);

            const response = await server.inject({
                method: "PUT",
                url: `/api/user/admin/password/${adminId}`,
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

    // Merubah data admin sendiri
    describe("when GET /user/admin/data", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();

            const response = await server.inject({
                method: "GET",
                url: "/api/user/admin/data",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.userAdmin).toBeDefined();
            expect(responseJson.data.userAdmin.admin_id).toBeDefined();
            expect(responseJson.data.userAdmin.email).toBeDefined();
        });
    });

    describe("when PUT /user/admin", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                fullname: 'Rizat Sakmir'
            }

            const response = await server.inject({
                method: "PUT",
                url: "/api/user/admin",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data,
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.message).toEqual("Admin user berhasil di update");
        });

        it("should response 400 Payload is required", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                fullname: ''
            }

            const response = await server.inject({
                method: "PUT",
                url: "/api/user/admin",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data,
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
        });
    });

    describe("when PUT /user/admin/password", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                passwordOld: 'Gaeng123',
                passwordNew: 'QwertyDevItindo@123'
            }

            const response = await server.inject({
                method: "PUT",
                url: "/api/user/admin/password",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data,
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.message).toEqual("Password admin user berhasil diperbarui");
        });

        it("should response 401 Password wrong", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                passwordOld: 'gaeng123',
                passwordNew: 'Amir00734.-'
            }

            const response = await server.inject({
                method: "PUT",
                url: "/api/user/admin/password",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data,
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(401);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Password yang anda berikan salah");
        });

        it("should response 400 Password new is not valid", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                passwordOld: 'Gaeng123',
                passwordNew: 'Amir00734'
            }

            const response = await server.inject({
                method: "PUT",
                url: "/api/user/admin/password",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data,
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Password tidak valid minimal 8 character, terdapat huruf besar, terdapat angka, dan terdapat character khusus");
        });

        it("should response 400 Payload is required", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                passwordOld: 'Gaeng123',
                passwordNew: ''
            }

            const response = await server.inject({
                method: "PUT",
                url: "/api/user/admin/password",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data,
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
        });
    });
})