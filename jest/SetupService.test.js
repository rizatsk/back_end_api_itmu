const pool_test = require("../databaseTest");
const app = require("../src/app");
const AuthenticationTestHelper = require("../test/AuthenticationTestHelper");
const LogActivityTestHelper = require("../test/LogActivityTestHelper");
const SetupServiceTestHelper = require("../test/SetupServiceTestHelper");


describe("/setup-service   endpoint", () => {
    const authenticationTestHelper = new AuthenticationTestHelper(pool_test);
    const logActivityTestHelper = new LogActivityTestHelper(pool_test);
    const setupServiceTestHelper = new SetupServiceTestHelper(pool_test);

    afterAll(async () => {
        await logActivityTestHelper.deleteLogActivity();
    });

    afterEach(async () => {
        await setupServiceTestHelper.deleteSetupService();
        await authenticationTestHelper.deleteAuthentication();
    });

    describe("when POST /setup-service", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                name: 'Pergantian RAM',
                detail: 'Pergantian RAM Laptop/Komputer',
                price: 50000,
                type: 'RAM',
            };

            const response = await server.inject({
                method: "POST",
                url: "/api/setup-service",
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.message).toEqual("Berhasil menambahkan setup service");
        });

        it("should response 403 unauthorized", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');
            const data = {
                name: 'Pergantian RAM',
                detail: 'Pergantian RAM Laptop/Komputer',
                price: 50000,
                type: 'RAM',
            };

            const response = await server.inject({
                method: "POST",
                url: "/api/setup-service",
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(403);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("You don't have access");
        });

        it("should response 400 name and service is available", async () => {
            const server = await app(pool_test);

            await setupServiceTestHelper.addSetupService();

            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                name: 'Pergantian RAM',
                detail: 'Pergantian RAM Laptop/Komputer',
                price: 50000,
                type: 'RAM',
            };

            const response = await server.inject({
                method: "POST",
                url: "/api/setup-service",
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Name and type setup is available");
        });

        it("should response 400 payload is invalid", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                name: 'Pergantian RAM',
                detail: 'Pergantian RAM Laptop/Komputer',
                price: 50000,
                // type: 'RAM',
            };

            const response = await server.inject({
                method: "POST",
                url: "/api/setup-service",
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
        });
    });

    describe("when GET /setup-service", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();

            const response = await server.inject({
                method: "GET",
                url: "/api/setup-service",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.setupServices).toBeDefined();
            expect(responseJson.totalData).toBeDefined();
            expect(responseJson.totalPage).toBeDefined();
        });

        it("should response 403 unathorized", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');

            const response = await server.inject({
                method: "GET",
                url: "/api/setup-service",
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

    describe("when GET /setup-service/{id}", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const setupServiceId = await setupServiceTestHelper.addSetupService();

            const response = await server.inject({
                method: "GET",
                url: `/api/setup-service/${setupServiceId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.setupService).toBeDefined();
        });

        it("should response 404 not found", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const setupServiceId = 'setup_service-123';

            const response = await server.inject({
                method: "GET",
                url: `/api/setup-service/${setupServiceId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Setup service tidak ditemukan");
        });

        it("should response 403 unathorized", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');
            const setupServiceId = await setupServiceTestHelper.addSetupService();

            const response = await server.inject({
                method: "GET",
                url: `/api/setup-service/${setupServiceId}`,
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

    describe("when PUT /setup-service/{id}", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const setupServiceId = await setupServiceTestHelper.addSetupService();

            const data = {
                name: 'Pergantian RAM2',
                detail: 'Pergantian RAM Laptop/Komputer2',
                price: 52000,
                type: 'RAM',
            };

            const response = await server.inject({
                method: "PUT",
                url: `/api/setup-service/${setupServiceId}`,
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.message).toEqual("Berhasil update setup service");
        });

        it("should response 400 payload is invalid", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const setupServiceId = await setupServiceTestHelper.addSetupService();

            const data = {
                name: 'Pergantian RAM2',
                // detail: 'Pergantian RAM Laptop/Komputer2',
                price: 52000,
                type: 'RAM',
            };

            const response = await server.inject({
                method: "PUT",
                url: `/api/setup-service/${setupServiceId}`,
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
        });

        it("should response 403", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');
            const setupServiceId = await setupServiceTestHelper.addSetupService();

            const data = {
                name: 'Pergantian RAM2',
                detail: 'Pergantian RAM Laptop/Komputer2',
                price: 52000,
                type: 'RAM',
            };

            const response = await server.inject({
                method: "PUT",
                url: `/api/setup-service/${setupServiceId}`,
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(403);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("You don't have access");
        });

        it("should response 404 is not found", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const setupServiceId = '_service-123';

            const data = {
                name: 'Pergantian RAM2',
                detail: 'Pergantian RAM Laptop/Komputer2',
                price: 52000,
                type: 'RAM',
            };

            const response = await server.inject({
                method: "PUT",
                url: `/api/setup-service/${setupServiceId}`,
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Gagal update setup service, setup service tidak ada");
        });
    });

    describe("when DELETE /setup-service/{id}", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const setupServiceId = await setupServiceTestHelper.addSetupService();

            const response = await server.inject({
                method: "DELETE",
                url: `/api/setup-service/${setupServiceId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.message).toEqual("Berhasil menghapus setup service");
        });

        it("should response 403 unathorized", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');
            const setupServiceId = await setupServiceTestHelper.addSetupService();

            const response = await server.inject({
                method: "DELETE",
                url: `/api/setup-service/${setupServiceId}`,
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
});