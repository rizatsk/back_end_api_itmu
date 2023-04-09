const pool_test = require("../databaseTest");
const app = require("../src/app");
const AuthenticationTestHelper = require("../test/AuthenticationTestHelper");
const CategoryProductTestHelper = require("../test/CategoryProductTestHelper");

describe("/authentications endpoint", () => {
  const authenticationTestHelper = new AuthenticationTestHelper(pool_test);
  const categoryProductTestHelper = new CategoryProductTestHelper(pool_test);

  afterAll(async () => {
    await categoryProductTestHelper.deleteCategoriesProduct();
  });

  afterEach(async () => {
    await authenticationTestHelper.deleteAuthentication();
  });

  describe("when POST /category_product", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();
      const data = {
        name: "Laptop",
      };

      const response = await server.inject({
        method: "POST",
        url: "/api/category_product",
        payload: data,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.categoryProductId).toBeDefined();
    });

    it("should response 400 is name category product is available", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();
      const data = {
        name: "Laptop",
      };

      const response = await server.inject({
        method: "POST",
        url: "/api/category_product",
        payload: data,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "Name category prodcut is available"
      );
    });
  });
});
