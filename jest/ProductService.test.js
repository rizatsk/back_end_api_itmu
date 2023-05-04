const pool_test = require("../databaseTest");
const app = require("../src/app");
const AuthenticationTestHelper = require("../test/AuthenticationTestHelper");
const LogActivityTestHelper = require("../test/LogActivityTestHelper");
const ProductServiceTestHelper = require("../test/ProductServiceTestHelper");


describe("/product-service   endpoint", () => {
    const authenticationTestHelper = new AuthenticationTestHelper(pool_test);
    const logActivityTestHelper = new LogActivityTestHelper(pool_test);
    const productServiceTestHelper = new ProductServiceTestHelper(pool_test);

    afterAll(async () => {
        await logActivityTestHelper.deleteLogActivity();
    });

    afterEach(async () => {
        await productServiceTestHelper.deleteProductService();
        await authenticationTestHelper.deleteAuthentication();
    });

    describe("when POST /product-service", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                name: "sistem",
                service: "install ulang os",
                price: 80000
            };

            const response = await server.inject({
                method: "POST",
                url: "/api/product-service",
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.message).toEqual("Berhasil menambahkan product service");
        });

        it("should response 403 unauthorized", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');
            const data = {
                name: "sistem",
                service: "install ulang os",
                price: 80000
            };

            const response = await server.inject({
                method: "POST",
                url: "/api/product-service",
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

            await productServiceTestHelper.addProductService();

            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                name: "sistem",
                service: "install ulang os",
                price: 80000
            };

            const response = await server.inject({
                method: "POST",
                url: "/api/product-service",
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Name and service product is available");
        });

        it("should response 400 payload is invalid", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                name: "sistem",
                price: 80000
            };

            const response = await server.inject({
                method: "POST",
                url: "/api/product-service",
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

    describe("when GET /product-service", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();

            const response = await server.inject({
                method: "GET",
                url: "/api/product-service",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.productServices).toBeDefined();
            expect(responseJson.totalData).toBeDefined();
            expect(responseJson.totalPage).toBeDefined();
        });

        it("should response 403 unathorized", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');

            const response = await server.inject({
                method: "GET",
                url: "/api/product-service",
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

    describe("when GET /product-service/{id}", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const productServiceId = await productServiceTestHelper.addProductService();

            const response = await server.inject({
                method: "GET",
                url: `/api/product-service/${productServiceId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.productService).toBeDefined();
        });

        it("should response 404 not found", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const productServiceId = 'product_service-123';

            const response = await server.inject({
                method: "GET",
                url: `/api/product-service/${productServiceId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Product service tidak ditemukan");
        });

        it("should response 403 unathorized", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');
            const productServiceId = await productServiceTestHelper.addProductService();

            const response = await server.inject({
                method: "GET",
                url: `/api/product-service/${productServiceId}`,
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

    describe("when PUT /product-service/{id}", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const productServiceId = await productServiceTestHelper.addProductService();

            const data = {
                name: "sistem",
                service: "install ulang os",
                price: 100000
            };

            const response = await server.inject({
                method: "PUT",
                url: `/api/product-service/${productServiceId}`,
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.message).toEqual("Berhasil update product service");
        });

        it("should response 400 payload is invalid", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const productServiceId = await productServiceTestHelper.addProductService();

            const data = {
                name: "sistem",
                service: "install ulang os",
            };

            const response = await server.inject({
                method: "PUT",
                url: `/api/product-service/${productServiceId}`,
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
            const productServiceId = await productServiceTestHelper.addProductService();

            const data = {
                name: "sistem",
                service: "install ulang os",
                price: 100000
            };

            const response = await server.inject({
                method: "PUT",
                url: `/api/product-service/${productServiceId}`,
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
            const productServiceId = 'product_service-123';

            const data = {
                name: "sistem",
                service: "install ulang os",
                price: 100000
            };

            const response = await server.inject({
                method: "PUT",
                url: `/api/product-service/${productServiceId}`,
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Gagal update product service, product service tidak ada");
        });
    });

    describe("when DELETE /product-service/{id}", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const productServiceId = await productServiceTestHelper.addProductService();

            const response = await server.inject({
                method: "DELETE",
                url: `/api/product-service/${productServiceId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.message).toEqual("Berhasil menghapus product service");
        });

        it("should response 403 unathorized", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');
            const productServiceId = await productServiceTestHelper.addProductService();

            const response = await server.inject({
                method: "DELETE",
                url: `/api/product-service/${productServiceId}`,
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