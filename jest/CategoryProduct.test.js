const pool_test = require("../databaseTest");
const app = require("../src/app");
const AuthenticationTestHelper = require("../test/AuthenticationTestHelper");
const AuthorizationTestHelper = require("../test/AuthorizationTestHelper");
const CategoryProductTestHelper = require("../test/CategoryProductTestHelper");
const LogActivityTestHelper = require("../test/LogActivityTestHelper");
const ProductTestHelper = require("../test/ProductTestHelper");
const UserAdminTestHelper = require("../test/UserAdminTestHelper");

describe("/category_product endpoint", () => {
  const userAdminTestHelper = new UserAdminTestHelper(pool_test);
  const authenticationTestHelper = new AuthenticationTestHelper(pool_test);
  const logActivityTestHelper = new LogActivityTestHelper(pool_test);
  const authorizationTestHelper = new AuthorizationTestHelper(pool_test);
  const categoryProductTestHelper = new CategoryProductTestHelper(pool_test);
  const productTestHelper = new ProductTestHelper(pool_test);

  afterAll(async () => {
    await logActivityTestHelper.deleteLogActivity();
  });

  afterEach(async () => {
    await userAdminTestHelper.deleteUserAdmin();
    await authorizationTestHelper.deleteAccessRole();
    await productTestHelper.deleteProduct();
    await categoryProductTestHelper.deleteCategoriesProduct();
    await authenticationTestHelper.deleteAuthentication();
  });

  describe("when POST /category_product", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();
      const data = {
        name: "komputer",
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
      // insert category product
      await categoryProductTestHelper.addCategoryChild();

      const data = {
        name: "komputer",
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
        "Name category, parent id is available"
      );
    });

    it("should response 403 Authorization", async () => {
      const server = await app(pool_test);
      const roleId = await authorizationTestHelper.addAccessRole();
      const adminId = await userAdminTestHelper.addUserAdmin({ roleId })
      const accessToken = authenticationTestHelper.getAccessTokenAdminUser(adminId);
      const data = {
        name: "komputer",
      };

      const response = await server.inject({
        method: "POST",
        url: "/api/category_product",
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

  describe("when GET /category_product", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();
      // insert category product
      await categoryProductTestHelper.addCategoryChild();

      const response = await server.inject({
        method: "GET",
        url: "/api/category_product",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.categories).toBeDefined();
      expect(responseJson.totalData).toBeDefined();
      expect(responseJson.totalPage).toBeDefined();
    });
  });

  describe("when GET /category_product/parent", () => {
    // Get data parent 2 hirarki
    it("should response 200", async () => {
      const server = await app(pool_test);
      await categoryProductTestHelper.addCategoryChild();

      const response = await server.inject({
        method: "GET",
        url: "/api/category_product/parent",
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.categories).toBeDefined();
      expect(responseJson.data.categories[0].parentName).toEqual('komputer');
    });
  });

  describe("when GET /category_product/tree", () => {
    // Get data parent 2 hirarki
    it("should response 200", async () => {
      const server = await app(pool_test);
      await categoryProductTestHelper.addCategoryChild();

      const response = await server.inject({
        method: "GET",
        url: "/api/category_product/tree",
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.categories).toBeDefined();
      expect(responseJson.data.categories[0].name).toEqual('komputer')
      expect(responseJson.data.categories[0].children[0].parentName).toEqual('komputer > RAM');
    });
  });

  describe("when GET /category_product/id", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();
      const categoryId = await categoryProductTestHelper.addCategoryChild();

      const response = await server.inject({
        method: "GET",
        url: `/api/category_product/${categoryId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.category).toBeDefined();
      expect(responseJson.data.category.parentName).toEqual('komputer');
    });

    it("should response 404 category is not found", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();

      const response = await server.inject({
        method: "GET",
        url: "/api/category_product/1",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("Category tidak ditemukan");
    });
  });

  describe("when PUT /category_product/status/id", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();
      const categoryId = await categoryProductTestHelper.addCategoryChild();

      const response = await server.inject({
        method: "PUT",
        url: `/api/category_product/status/${categoryId}`,
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
      expect(responseJson.message).toEqual("Berhasil merubah status category")
    });

    it("should response 400 payload status is required", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();

      const response = await server.inject({
        method: "PUT",
        url: "/api/category_product/status/1",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: {
          status: null
        }
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
      const categoryId = await categoryProductTestHelper.addCategoryChild();

      const response = await server.inject({
        method: "PUT",
        url: `/api/category_product/status/${categoryId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: {
          status: false
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("You don't have access");
    });
  });

  describe("when PUT /category_product/id", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();
      const categoryId = await categoryProductTestHelper.addCategoryChild();

      const response = await server.inject({
        method: "PUT",
        url: `/api/category_product/${categoryId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Storage'
        }
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.message).toEqual("Berhasil merubah data category")
    });

    it("should response 400 payload name is required", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();

      const response = await server.inject({
        method: "PUT",
        url: "/api/category_product/1",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: null
        }
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
      const categoryId = await categoryProductTestHelper.addCategoryChild();

      const response = await server.inject({
        method: "PUT",
        url: `/api/category_product/${categoryId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Storage'
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("You don't have access");
    });
  });

  describe("when DELETE /category_product/id", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();
      const categoryId = await categoryProductTestHelper.addCategoryChild();

      const response = await server.inject({
        method: "DELETE",
        url: `/api/category_product/${categoryId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.message).toEqual("Berhasil menghapus category")
    });

    it("should response 400 product have category", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();
      const categoryId = await categoryProductTestHelper.addCategoryChild();
      await productTestHelper.addProduct({
        name: 'Keyboard',
        categoryId,
        price: 8999121,
        typeProduct: 'Keyboard Gaming',
        description: "Only test"
      })

      const response = await server.inject({
        method: "DELETE",
        url: `/api/category_product/${categoryId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("Gagal menghapus, product Keyboard menggunakan category ini");
    });

    it("should response 403 Authorization", async () => {
      const server = await app(pool_test);
      const roleId = await authorizationTestHelper.addAccessRole();
      const adminId = await userAdminTestHelper.addUserAdmin({ roleId })
      const accessToken = authenticationTestHelper.getAccessTokenAdminUser(adminId);
      const categoryId = await categoryProductTestHelper.addCategoryChild();

      const response = await server.inject({
        method: "DELETE",
        url: `/api/category_product/${categoryId}`,
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
});
