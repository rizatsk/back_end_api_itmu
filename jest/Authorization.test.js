const pool_test = require("../databaseTest");
const app = require("../src/app");
const AuthenticationTestHelper = require("../test/AuthenticationTestHelper");
const LogActivityTestHelper = require("../test/LogActivityTestHelper");
const AuthorizationTestHelper = require("../test/AuthorizationTestHelper");
const Authorization = require('../config/authorization.json');

describe("/authorization endpoint", () => {
    const authenticationTestHelper = new AuthenticationTestHelper(pool_test);
    const logActivityTestHelper = new LogActivityTestHelper(pool_test);
    const authorizationTestHelper = new AuthorizationTestHelper(pool_test);

    afterAll(async () => {
        await logActivityTestHelper.deleteLogActivity();
    });

    afterEach(async () => {
        await authenticationTestHelper.deleteAuthentication();
        await authorizationTestHelper.deleteAccessRole();
    });

    describe("when GET /authorization", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();

            const response = await server.inject({
                method: "GET",
                url: "/api/authorization",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.authorizations).toBeDefined();
        });
    });

    describe("when GET /authorization/role-user", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();

            const response = await server.inject({
                method: "GET",
                url: "/api/authorization/role-user",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.roleUsers).toBeDefined();
            expect(responseJson.totalData).toEqual(2);
            expect(responseJson.totalPage).toEqual(1);
            // console.log(responseJson)
        });
    });

    describe("when POST /authorization/role-user", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();

            const payload = {
                name: 'admin_product',
                accessRole: [Authorization.product["insert product"], Authorization.product["update product"]]
            }

            const response = await server.inject({
                method: "POST",
                url: "/api/authorization/role-user",
                payload: payload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
        });

        it("should response 400 payload required", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();

            const payload = {
                name: 'admin_product',
                // accessRole: [Authorization.product["insert product"], Authorization.product["update product"]]
            }

            const response = await server.inject({
                method: "POST",
                url: "/api/authorization/role-user",
                payload: payload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
        });

        it("should response 400 name is available", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();

            const payload = {
                name: 'admin',
                accessRole: [Authorization.product["insert product"], Authorization.product["update product"]]
            }

            const response = await server.inject({
                method: "POST",
                url: "/api/authorization/role-user",
                payload: payload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Access role name sudah tersedia");
        });
    });

    describe("when GET /authorization/role-user/{roleId}", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const roleId = await authorizationTestHelper.addAccessRole();

            const response = await server.inject({
                method: "GET",
                url: `/api/authorization/role-user/${roleId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.roleUser).toBeDefined();
            expect(responseJson.data.roleUser.role_id).toBeDefined();
            expect(responseJson.data.roleUser.role_name).toBeDefined();
            expect(responseJson.data.roleUser.access_role).toBeDefined();
        });

        it("should response 404 is not found", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const roleId = 4321;

            const response = await server.inject({
                method: "GET",
                url: `/api/authorization/role-user/${roleId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Access role tidak ditemukan");
        });
    });

    describe("when PUT /authorization/role-user/{roleId}", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const roleId = await authorizationTestHelper.addAccessRole();
            const data = {
                name: 'admin_product',
                accessRole: [Authorization.product["insert product"], Authorization.product["update product"]]
            }

            const response = await server.inject({
                method: "PUT",
                url: `/api/authorization/role-user/${roleId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.message).toEqual("Berhasil update role access");
        });

        it("should response 400 name is available", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const roleId = await authorizationTestHelper.addAccessRole();
            const data = {
                name: 'admin',
                accessRole: [Authorization.product["insert product"], Authorization.product["update product"]]
            }

            const response = await server.inject({
                method: "PUT",
                url: `/api/authorization/role-user/${roleId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Access role name sudah tersedia");
        });

        it("should response 400 payload accessRole it is not in accordance", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const roleId = await authorizationTestHelper.addAccessRole();
            const data = {
                name: 'admin_product',
                accessRole: `Authorization.product["insert product"], Authorization.product["update product"]`
            }

            const response = await server.inject({
                method: "PUT",
                url: `/api/authorization/role-user/${roleId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
        });

        it("should response 404 is not found", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const roleId = 4321;
            const data = {
                name: 'admin_product',
                accessRole: [Authorization.product["insert product"], Authorization.product["update product"]]
            }

            const response = await server.inject({
                method: "PUT",
                url: `/api/authorization/role-user/${roleId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Gagal update access role");
        });

        it("should response 400 payload is required", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const roleId = await authorizationTestHelper.addAccessRole();
            const data = {
                name: 'admin_product',
            }

            const response = await server.inject({
                method: "PUT",
                url: `/api/authorization/role-user/${roleId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
        });
    });

    describe("when DELETE /authorization/role-user/{roleId}", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const roleId = await authorizationTestHelper.addAccessRole();

            const response = await server.inject({
                method: "DELETE",
                url: `/api/authorization/role-user/${roleId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
        });

        it("should response 400 role id uses at user admin", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const roleId = 1;

            const response = await server.inject({
                method: "DELETE",
                url: `/api/authorization/role-user/${roleId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Gagal menghapus access role, role id digunakan oleh user admin");
        });

        it("should response 404 is not found", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const roleId = 4321;

            const response = await server.inject({
                method: "DELETE",
                url: `/api/authorization/role-user/${roleId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Gagal menghapus access role, role id tidak ditemukan");
        });
    });
});