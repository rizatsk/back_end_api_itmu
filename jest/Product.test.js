const path = require("path");
const fs = require("fs");
const pool_test = require("../databaseTest");
const app = require("../src/app");
const FormData = require("form-data");
const AuthenticationTestHelper = require("../test/AuthenticationTestHelper");
const ProductTestHelper = require("../test/ProductTestHelper");
const LogActivityTestHelper = require("../test/LogActivityTestHelper");
const CategoryProductTestHelper = require("../test/CategoryProductTestHelper");

describe("/products endpoint", () => {
  const authenticationTestHelper = new AuthenticationTestHelper(pool_test);
  const productTestHelper = new ProductTestHelper(pool_test);
  const logActivityTestHelper = new LogActivityTestHelper(pool_test);
  const categoryProductTestHelper = new CategoryProductTestHelper(pool_test);

  const storagePublic = path.resolve(__dirname, "images");
  const image1 = fs.readFileSync(`${storagePublic}/pp putih polos.jpg`);
  const image2 = fs.readFileSync(`${storagePublic}/Logo.png`);
  const imageLarge = fs.readFileSync(`${storagePublic}/3800_8_04.jpg`);
  let productId = "";
  let images = [];
  let thiscategoryId = "";

  afterAll(async () => {
    await logActivityTestHelper.deleteLogActivity();
    await productTestHelper.deleteProduct();
    productTestHelper.deleteImageProduct();
    await categoryProductTestHelper.deleteCategoriesProduct();
  });

  afterEach(async () => {
    await authenticationTestHelper.deleteAuthentication();
  });

  describe("when POST /product", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();
      const categoryId = await categoryProductTestHelper.addCategoryChild();
      thiscategoryId = categoryId;

      const payload = new FormData();
      payload.append("name", "Logo ITINDO");
      payload.append("categoryId", categoryId)
      payload.append("price", 500000);
      payload.append("typeProduct", "logo");
      payload.append("description", "Logo itindo terdapat logo 404 dan ITINDO");
      payload.append("image", image1, { filename: "pp putih polos.jpg" });
      payload.append("image", image2, { filename: "Logo.png" });

      const response = await server.inject({
        method: "POST",
        url: "/api/product",
        payload: payload.getBuffer(),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...payload.getHeaders({
            "Content-Length": payload.getLengthSync(),
            "Content-Type": `multipart/form-data; boundary=${payload._boundary}`,
          }),
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });

    it("should response 400 payload is required", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();

      const payload = new FormData();
      payload.append("name", "Logo ITINDO");
      payload.append("price", 500000);
      payload.append("description", "Logo itindo terdapat logo 404 dan ITINDO");
      payload.append("image", image1, { filename: "pp putih polos.jpg" });
      payload.append("image", image2, { filename: "Logo.png" });

      const response = await server.inject({
        method: "POST",
        url: "/api/product",
        payload: payload.getBuffer(),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...payload.getHeaders({
            "Content-Length": payload.getLengthSync(),
            "Content-Type": `multipart/form-data; boundary=${payload._boundary}`,
          }),
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
    });

    it("should response 413 to large image size maximum 51200Kb", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();

      const payload = new FormData();
      payload.append("name", "Logo ITINDO");
      payload.append("categoryId", thiscategoryId)
      payload.append("price", 500000);
      payload.append("typeProduct", "logo");
      payload.append("description", "Logo itindo terdapat logo 404 dan ITINDO");
      payload.append("image", image1, { filename: "pp putih polos.jpg" });
      payload.append("image", imageLarge, { filename: "image_large.jpg" });

      const response = await server.inject({
        method: "POST",
        url: "/api/product",
        payload: payload.getBuffer(),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...payload.getHeaders({
            "Content-Length": payload.getLengthSync(),
            "Content-Type": `multipart/form-data; boundary=${payload._boundary}`,
          }),
        },
      });

      expect(response.statusCode).toEqual(413);
    });

    it("should response 400 to name product is already", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();

      const payload = new FormData();
      payload.append("name", "Logo ITINDO");
      payload.append("categoryId", thiscategoryId)
      payload.append("price", 500000);
      payload.append("typeProduct", "logo");
      payload.append("description", "Logo itindo terdapat logo 404 dan ITINDO");
      payload.append("image", image1, { filename: "pp putih polos.jpg" });

      const response = await server.inject({
        method: "POST",
        url: "/api/product",
        payload: payload.getBuffer(),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...payload.getHeaders({
            "Content-Length": payload.getLengthSync(),
            "Content-Type": `multipart/form-data; boundary=${payload._boundary}`,
          }),
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("Nama product sudah ada");
    });
  });

  describe("when GET /products", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);

      const response = await server.inject({
        method: "GET",
        url: "/api/product?page=1&limit=10",
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.products).toBeDefined();
      expect(responseJson.data.products).toHaveLength(1);
      expect(responseJson.data.products[0].product_id).toBeDefined();
      expect(responseJson.totalData).toBeDefined();
      expect(responseJson.totalPage).toBeDefined();
      productId = responseJson.data.products[0].product_id;
    });
  });

  describe("when GET /products/{id}", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);

      const response = await server.inject({
        method: "GET",
        url: `/api/product/${productId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.product).toBeDefined();
      expect(responseJson.data.product).toHaveProperty("product_id");
      expect(responseJson.data.imageProduct).toBeDefined();
      expect(responseJson.data.imageProduct).toHaveLength(2);
      const imagesProduct = responseJson.data.imageProduct;
      imagesProduct.map((image) => {
        images.push({ id: image.imageproductid, link: image.link });
      });
    });

    it("should response 404 product is not found", async () => {
      const server = await app(pool_test);

      const response = await server.inject({
        method: "GET",
        url: `/api/product/asalolejos`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("Product tidak ditemukan");
    });
  });

  describe("when PUT /product/{id}", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();

      const payload = {
        name: "monitor lg",
        price: 610000,
        categoryId: thiscategoryId,
        typeProduct: "monitor",
        description: "oke",
      };

      const response = await server.inject({
        method: "PUT",
        url: `/api/product/${productId}`,
        payload: payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.message).toEqual("Berhasil update data product");
    });

    it("should response 400 name product is available", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();

      const payload = {
        name: "monitor lg",
        categoryId: thiscategoryId,
        price: 610000,
        typeProduct: "monitor",
        description: "oke",
      };

      const response = await server.inject({
        method: "PUT",
        url: `/api/product/asalolejos`,
        payload: payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("Nama product tersedia");
    });

    it("should response 400 payload is required", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();

      const payload = {
        name: "monitor lg",
        price: 610000,
        typeProduct: "monitor",
      };

      const response = await server.inject({
        method: "PUT",
        url: `/api/product/${productId}`,
        payload: payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
    });
  });

  describe("when PUT /product/status/{id}", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();

      const payload = {
        status: false,
      };

      const response = await server.inject({
        method: "PUT",
        url: `/api/product/status/${productId}`,
        payload: payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.message).toEqual("Berhasil update data product");
    });

    it("should response 400 payload is required", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();

      const payload = {};

      const response = await server.inject({
        method: "PUT",
        url: `/api/product/status/${productId}`,
        payload: payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
    });
  });

  describe("when PUT /product/images/{id}", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();
      const payload = new FormData();
      payload.append("postImages", image2, { filename: "Logo.png" });
      payload.append("deleteImages", JSON.stringify([images[0].id]));

      const response = await server.inject({
        method: "PUT",
        url: `/api/product/images/${productId}`,
        payload: payload.getBuffer(),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...payload.getHeaders({
            "Content-Length": payload.getLengthSync(),
            "Content-Type": `multipart/form-data; boundary=${payload._boundary}`,
          }),
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.message).toEqual("Berhasil update image product");
    });

    it("should response 413", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();
      const payload = new FormData();
      payload.append("postImages", imageLarge, { filename: "image_large.jpg" });
      payload.append("deleteImages", JSON.stringify([images[1].id]));

      const response = await server.inject({
        method: "PUT",
        url: `/api/product/images/${productId}`,
        payload: payload.getBuffer(),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...payload.getHeaders({
            "Content-Length": payload.getLengthSync(),
            "Content-Type": `multipart/form-data; boundary=${payload._boundary}`,
          }),
        },
      });

      expect(response.statusCode).toEqual(413);
    });
  });

  describe("when DELETE /product/{id}", () => {
    it("should response 200", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();

      const response = await server.inject({
        method: "DELETE",
        url: `/api/product/${productId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.message).toEqual("Berhasil menghapus data product");
    });

    it("should response 404", async () => {
      const server = await app(pool_test);
      const accessToken = authenticationTestHelper.getAccessToken();

      const response = await server.inject({
        method: "DELETE",
        url: `/api/product/asalole jos`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("Product id tidak ditemukan");
    });
  });
});
