const pool_test = require("../databaseTest");
const app = require("../src/app");
const AuthenticationTestHelper = require("../test/AuthenticationTestHelper");
const LogActivityTestHelper = require("../test/LogActivityTestHelper");
const RequestServiceTestHelper = require("../test/RequestServiceTestHelper");
const UserItindoTestHelper = require("../test/UserItindoTestHelper");

describe("/request-service User Admin endpoint", () => {
    const userItindoTestHelper = new UserItindoTestHelper(pool_test);
    const logActivityTestHelper = new LogActivityTestHelper(pool_test);
    const authenticationTestHelper = new AuthenticationTestHelper(pool_test);
    const requestServiceTestHelper = new RequestServiceTestHelper(pool_test);

    afterAll(async () => {
        await logActivityTestHelper.deleteLogActivity();
    });

    afterEach(async () => {
        await requestServiceTestHelper.deleteRequestService();
        await authenticationTestHelper.deleteAuthentication();
        await userItindoTestHelper.deleteUserItindo();
    });


    describe("when GET /request-service/before", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);

            const response = await server.inject({
                method: "GET",
                url: "/api/request-service/before",
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.devices).toBeDefined();
            expect(responseJson.data.devices.devices[0]).toEqual("komputer");
            expect(responseJson.data.devices.devices[1]).toEqual("laptop");
            expect(responseJson.data.deviceServices).toBeDefined();
        });
    });

    describe("when POST /request-service", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);

            const userId = await userItindoTestHelper.addUserItindo();
            const accessToken = authenticationTestHelper.getAccessTokenUser(userId);

            const data = {
                device: "laptop",
                brand: "asus",
                cracker: "layar lcd",
                servicing: "kunjungan toko",
                estimationPrice: 750000,
            };

            const response = await server.inject({
                method: "POST",
                url: "/api/request-service",
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.message).toEqual("Berhasil menambahkan request service");
        });

        it("should response 400 payload is required", async () => {
            const server = await app(pool_test);

            const userId = await userItindoTestHelper.addUserItindo();
            const accessToken = authenticationTestHelper.getAccessTokenUser(userId);

            const data = {
                device: "laptop",
                brand: "asus",
                cracker: "layar lcd",
                servicing: "kunjungan toko",
                // estimationPrice: 750000,
            };

            const response = await server.inject({
                method: "POST",
                url: "/api/request-service",
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

    describe("when GET /request-service/user/id", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);

            const userId = await userItindoTestHelper.addUserItindo();
            const accessToken = authenticationTestHelper.getAccessTokenUser(userId);
            const requestId = await requestServiceTestHelper.addRequestService({ userId });

            const response = await server.inject({
                method: "GET",
                url: `/api/request-service/user/${requestId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.requestService).toBeDefined();
            expect(responseJson.data.trackHistoryService).toBeDefined();
        });

        it("should response 404 request service not found", async () => {
            const server = await app(pool_test);

            const userId = await userItindoTestHelper.addUserItindo();
            const accessToken = authenticationTestHelper.getAccessTokenUser(userId);
            const requestId = 'request_service-123';

            const response = await server.inject({
                method: "GET",
                url: `/api/request-service/user/${requestId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Request service tidak ditemukan");
        });
    });

    describe("when GET /request-service", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);

            const userId = await userItindoTestHelper.addUserItindo();
            await requestServiceTestHelper.addRequestService({ userId });
            const accessToken = authenticationTestHelper.getAccessToken();

            const response = await server.inject({
                method: "GET",
                url: `/api/request-service`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.requestServices).toBeDefined();
            expect(responseJson.totalData).toBeDefined();
            expect(responseJson.totalPage).toBeDefined();
        });

        it("should response 403 unathorized", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');

            const response = await server.inject({
                method: "GET",
                url: `/api/request-service`,
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

    describe("when GET /request-service/id", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);

            const userId = await userItindoTestHelper.addUserItindo();
            const requestId = await requestServiceTestHelper.addRequestService({ userId });
            const accessToken = authenticationTestHelper.getAccessToken();

            const response = await server.inject({
                method: "GET",
                url: `/api/request-service/${requestId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.requestService).toBeDefined();
            // expect(responseJson.data.trackHistoryService).toBeDefined();
        });

        it("should response 403 unauthorized", async () => {
            const server = await app(pool_test);

            const userId = await userItindoTestHelper.addUserItindo();
            const requestId = await requestServiceTestHelper.addRequestService({ userId });
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');

            const response = await server.inject({
                method: "GET",
                url: `/api/request-service/${requestId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(403);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("You don't have access");
        });

        it("should response 404 request not found", async () => {
            const server = await app(pool_test);
            const requestId = 'request_service-123';
            const accessToken = authenticationTestHelper.getAccessToken();

            const response = await server.inject({
                method: "GET",
                url: `/api/request-service/${requestId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Request service tidak ditemukan");
        });
    });

    describe("when GET /request-service/track-history/id", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);

            const userId = await userItindoTestHelper.addUserItindo();
            const requestId = await requestServiceTestHelper.addRequestService({ userId });
            const accessToken = authenticationTestHelper.getAccessToken();

            const response = await server.inject({
                method: "GET",
                url: `/api/request-service/track-history/${requestId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.trackHistoryService).toBeDefined();
        });
    })

    describe("when PUT /request-service/status-realprice/id", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);

            const userId = await userItindoTestHelper.addUserItindo();
            const requestId = await requestServiceTestHelper.addRequestService({ userId });
            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                status: 'in progress',
                realPrice: 80000
            };

            const response = await server.inject({
                method: "PUT",
                url: `/api/request-service/status-realprice/${requestId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data,
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.message).toEqual("Berhasil update status request service");
        });

        it("should response 403 unauthorized", async () => {
            const server = await app(pool_test);

            const userId = await userItindoTestHelper.addUserItindo();
            const requestId = await requestServiceTestHelper.addRequestService({ userId });
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');
            const data = {
                status: 'in progress',
                realPrice: 80000
            };

            const response = await server.inject({
                method: "PUT",
                url: `/api/request-service/status-realprice/${requestId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data,
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(403);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("You don't have access");
        });

        it("should response 400 payload is not valid", async () => {
            const server = await app(pool_test);

            const userId = await userItindoTestHelper.addUserItindo();
            const requestId = await requestServiceTestHelper.addRequestService({ userId });
            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                status: '',
                realprice: 0,
            };

            const response = await server.inject({
                method: "PUT",
                url: `/api/request-service/status-realprice/${requestId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data,
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
        });

        it("should response 404 fail update service is not found", async () => {
            const server = await app(pool_test);

            const requestId = 'request_service-123';
            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                status: 'in progress',
                realPrice: 80000
            };

            const response = await server.inject({
                method: "PUT",
                url: `/api/request-service/status-realprice/${requestId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: data,
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Gagal update status request service, request service tidak ada");
        });
    });
})