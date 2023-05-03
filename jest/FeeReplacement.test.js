const pool_test = require("../databaseTest");
const app = require("../src/app");
const AuthenticationTestHelper = require("../test/AuthenticationTestHelper");
const CategoryProductTestHelper = require("../test/CategoryProductTestHelper");
const FeeReplacementTestHelper = require("../test/FeeReplacementTestHelper");
const LogActivityTestHelper = require("../test/LogActivityTestHelper");
const ProductTestHelper = require("../test/ProductTestHelper");


describe("/fee-replacement endpoint", () => {
    const authenticationTestHelper = new AuthenticationTestHelper(pool_test);
    const logActivityTestHelper = new LogActivityTestHelper(pool_test);
    const categoryProductTestHelper = new CategoryProductTestHelper(pool_test);
    const productTestHelper = new ProductTestHelper(pool_test);
    const feeReplacementTestHelper = new FeeReplacementTestHelper(pool_test);

    afterAll(async () => {
        await logActivityTestHelper.deleteLogActivity();
    });

    afterEach(async () => {
        await productTestHelper.deleteProduct();
        await categoryProductTestHelper.deleteCategoriesProduct();
        await feeReplacementTestHelper.deleteFeeReplacement();
        await authenticationTestHelper.deleteAuthentication();
    });

    describe("when POST /fee-replacement", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                name: "replacement storage",
                price: 80000
            };

            const response = await server.inject({
                method: "POST",
                url: "/api/fee-replacement",
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.message).toEqual("Berhasil menambahkan fee replacement");
        });

        it("should response 403", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');
            const data = {
                name: "replacement storage",
                price: 80000
            };

            const response = await server.inject({
                method: "POST",
                url: "/api/fee-replacement",
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

        it("should response 400 name is available", async () => {
            const server = await app(pool_test);

            await feeReplacementTestHelper.addFeeReplacement();

            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                name: "replacement storage",
                price: 80000
            };

            const response = await server.inject({
                method: "POST",
                url: "/api/fee-replacement",
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Name fee replacements is available");
        });

        it("should response 400 payload is invalid", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                name: "replacement storage",
            };

            const response = await server.inject({
                method: "POST",
                url: "/api/fee-replacement",
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

    describe("when GET /fee-replacement", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();

            const response = await server.inject({
                method: "GET",
                url: "/api/fee-replacement",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.feeReplacements).toBeDefined();
            expect(responseJson.totalData).toBeDefined();
            expect(responseJson.totalPage).toBeDefined();
        });

        it("should response 403", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');

            const response = await server.inject({
                method: "GET",
                url: "/api/fee-replacement",
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

    describe("when GET /fee-replacement/for/product", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();

            const response = await server.inject({
                method: "GET",
                url: "/api/fee-replacement",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.feeReplacements).toBeDefined();
        });
    });

    describe("when GET /fee-replacement/{id}", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const feeReplacementId = await feeReplacementTestHelper.addFeeReplacement();
            const accessToken = authenticationTestHelper.getAccessToken();

            const response = await server.inject({
                method: "GET",
                url: `/api/fee-replacement/${feeReplacementId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.feeReplacement).toBeDefined();
        });

        it("should response 404", async () => {
            const server = await app(pool_test);
            const feeReplacementId = "fee_replacement-123";
            const accessToken = authenticationTestHelper.getAccessToken();

            const response = await server.inject({
                method: "GET",
                url: `/api/fee-replacement/${feeReplacementId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Fee replacement tidak ditemukan");
        });

        it("should response 403", async () => {
            const server = await app(pool_test);
            const feeReplacementId = await feeReplacementTestHelper.addFeeReplacement();
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');

            const response = await server.inject({
                method: "GET",
                url: `/api/fee-replacement/${feeReplacementId}`,
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

    describe("when PUT /fee-replacement/{id}", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const feeReplacementId = await feeReplacementTestHelper.addFeeReplacement();
            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                name: "replacement storage 2",
                price: 80000
            };

            const response = await server.inject({
                method: "PUT",
                url: `/api/fee-replacement/${feeReplacementId}`,
                payload: data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.message).toEqual("Berhasil update fee replacement");
        });

        it("should response 403", async () => {
            const server = await app(pool_test);
            const feeReplacementId = await feeReplacementTestHelper.addFeeReplacement();
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');
            const data = {
                name: "replacement storage 2",
                price: 80000
            };

            const response = await server.inject({
                method: "PUT",
                url: `/api/fee-replacement/${feeReplacementId}`,
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

        it("should response 400 payload is invalid", async () => {
            const server = await app(pool_test);

            const feeReplacementId = await feeReplacementTestHelper.addFeeReplacement();

            const accessToken = authenticationTestHelper.getAccessToken();
            const data = {
                name: "replacement storage",
            };

            const response = await server.inject({
                method: "PUT",
                url: `/api/fee-replacement/${feeReplacementId}`,
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

    describe("when DELETE /fee-replacement/{id}", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const feeReplacementId = await feeReplacementTestHelper.addFeeReplacement();
            const accessToken = authenticationTestHelper.getAccessToken();

            const response = await server.inject({
                method: "DELETE",
                url: `/api/fee-replacement/${feeReplacementId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.message).toEqual("Berhasil menghapus fee replacement");
        });

        it("should response 400 fee replacement available in product", async () => {
            const server = await app(pool_test);
            const feeReplacementId = await feeReplacementTestHelper.addFeeReplacement();
            const categoryId = await categoryProductTestHelper.addCategoryChild();
            await feeReplacementTestHelper.addProduct(feeReplacementId, categoryId);

            const accessToken = authenticationTestHelper.getAccessToken();

            const response = await server.inject({
                method: "DELETE",
                url: `/api/fee-replacement/${feeReplacementId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toEqual("Fee replacement is available in product");
        });

        it("should response 403", async () => {
            const server = await app(pool_test);
            const feeReplacementId = await feeReplacementTestHelper.addFeeReplacement();
            const accessToken = authenticationTestHelper.getAccessTokenAdminUser('admin-00000002');

            const response = await server.inject({
                method: "DELETE",
                url: `/api/fee-replacement/${feeReplacementId}`,
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