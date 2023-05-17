const pool_test = require("../databaseTest");
const app = require("../src/app");
const AuthenticationTestHelper = require("../test/AuthenticationTestHelper");

describe("/dashboard endpoint", () => {
    const authenticationTestHelper = new AuthenticationTestHelper(pool_test);

    afterEach(async () => {
        await authenticationTestHelper.deleteAuthentication();
    });

    describe("when GET /dashboard", () => {
        it("should response 200", async () => {
            const server = await app(pool_test);
            const accessToken = authenticationTestHelper.getAccessToken();

            const response = await server.inject({
                method: "GET",
                url: "/api/dashboard",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.amount).toBeDefined();
            expect(responseJson.data.roleUserAdmins).toBeDefined();
            expect(responseJson.data.statusRequestService).toBeDefined();
            expect(responseJson.data.requestServices).toBeDefined();
        });
    });
});