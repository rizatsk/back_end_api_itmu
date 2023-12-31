require("dotenv").config();

const Hapi = require("@hapi/hapi");
const ClientError = require("./exceptions/ClientError");
const path = require("path");
const Jwt = require("@hapi/jwt");
const Inert = require("@hapi/inert");
const Lock = require("async-lock");

// Token Manager
const TokenManager = require("./tokenize/TokenManager");
// Log Activity Service
const LogActivityService = require("./services/postgres/LogActivityService");

// Authentication
const authentication = require("./api/authentication");
const AuthenticationService = require("./services/postgres/AuthenticationService");
const AuthenticationValidator = require("./validator/authentication");

// User
const users = require("./api/users");
const UsersService = require("./services/postgres/UsersService");
const UsersValidator = require("./validator/users");

// Package Services
const packageServices = require("./api/packageServices");
const PackageServiceService = require("./services/postgres/PackageServiceService");
const PackageServiceValidator = require("./validator/packageService");

// Products
const products = require("./api/products");
const ProductsService = require("./services/postgres/ProductsService");
const ProductsValidator = require("./validator/products");

// Storage
const storages = require("./api/storages");
const StorageService = require("./services/storage/StorageService");

// User Itindo
const userItindo = require("./api/userItindo");
const UserItindoService = require("./services/postgres/UserItindoService");
const UserItindoValidator = require("./validator/userItindo");

// Authentication itindo
const authenticationItindo = require("./api/authenticationItindo");

// Category Product
const categoryProduct = require("./api/categoryProduct");
const CategoryProductService = require("./services/postgres/CategoryProductService");
const CategoryProductValidator = require("./validator/categoryProduct");

// Authorization
const authorization = require("./api/authorization");
const AuthorizationService = require("./services/postgres/AuthorizationService");
const AuthorizationValidator = require("./validator/authorization");

// Request service
const requestService = require("./api/requestService");
const RequestServiceService = require("./services/postgres/RequestServiceService");
const RequestServiceValidator = require("./validator/requestService");

// setup service
const setupService = require("./api/setupService");
const SetupServiceService = require("./services/postgres/SetupServiceService");
const SetupServiceValidator = require("./validator/setupService");

// Token validation user
const TokenValidationUserService = require('./services/postgres/TokenValidationUserService')

// Dashboard
const dashboard = require("./api/dashboard");
const DashboardService = require('./services/postgres/DashboardService');

// Failed Authentications 
const FailedAuthenticationService = require('./services/postgres/FailedAuthenticationService')

// Product test
const productTest = require('./api/productTest');
const ProductTestService = require('./services/postgres/ProductTestService')
const ProductTestValidator = require('./validator/productTest')

const app = async (pool) => {
  const lock = new Lock();

  const failedAuthenticationService = new FailedAuthenticationService({ pool });

  const usersService = new UsersService({ pool, failedAuthenticationService });
  const authenticationService = new AuthenticationService({ pool });
  const logActivityService = new LogActivityService({ pool });
  const packageServiceService = new PackageServiceService({ pool });
  const productsService = new ProductsService({ pool });
  const storageService = new StorageService(
    path.resolve(__dirname, "public/images")
  );
  const storageImage = path.resolve(__dirname, "public/images");
  const storagePublic = path.resolve(__dirname, "public");
  const authorizationService = new AuthorizationService({ pool });
  const userItindoService = new UserItindoService({ pool });
  const categoryProductService = new CategoryProductService({ pool });
  const requestServiceService = new RequestServiceService({ pool });
  const setupServiceService = new SetupServiceService({ pool });
  const tokenValidationUserService = new TokenValidationUserService({ pool })
  const dashboardService = new DashboardService({ pool });
  const productTestService = new ProductTestService({ pool });

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  // Register plugin external
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
    {
      plugin: require("hapi-remote-address"),
    },
  ]);

  // mendifiniskan strategy autentekasi jwt
  server.auth.strategy("itindosolution_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  server.auth.strategy("itindosolution_user_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY_USER,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  //  Penganganan Error Server Pada Handler
  server.ext("onPreResponse", (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    if (response instanceof ClientError) {
      // membuat response baru dari response toolkit sesuai kebutuhan error handling
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return response.continue || response;
  });

  await server.register([
    {
      plugin: authentication,
      options: {
        lock,
        authenticationService,
        usersService,
        logActivityService,
        tokenManager: TokenManager,
        validator: AuthenticationValidator,
        userItindoService,
      },
    },
    {
      plugin: users,
      options: {
        lock,
        service: usersService,
        logActivityService,
        authentication: authenticationService,
        authorizationService,
        validator: UsersValidator,
        tokenValidationUserService,
        storagePublic,
        tokenManager: TokenManager,
      },
    },
    {
      plugin: packageServices,
      options: {
        lock,
        service: packageServiceService,
        logActivityService,
        validator: PackageServiceValidator,
        storageService,
      },
    },
    {
      plugin: products,
      options: {
        lock,
        service: productsService,
        logActivityService,
        validator: ProductsValidator,
        storageService,
        authorizationService,
        categoryService: categoryProductService,
      },
    },
    {
      plugin: storages,
      options: {
        storageImage,
        storagePublic
      },
    },
    {
      plugin: userItindo,
      options: {
        lock,
        service: userItindoService,
        validator: UserItindoValidator,
        tokenManager: TokenManager,
        authenticationService,
        logActivityService,
        authorizationService,
        tokenValidationUserService,
        storagePublic
      },
    },
    {
      plugin: authenticationItindo,
      options: {
        lock,
        authenticationService,
        userItindoService,
        logActivityService,
        tokenManager: TokenManager,
        validator: AuthenticationValidator,
      },
    },
    {
      plugin: categoryProduct,
      options: {
        lock,
        service: categoryProductService,
        validator: CategoryProductValidator,
        authorizationService,
        productService: productsService,
        logActivityService,
      },
    },
    {
      plugin: authorization,
      options: {
        lock,
        service: authorizationService,
        validator: AuthorizationValidator,
      },
    },
    {
      plugin: requestService,
      options: {
        lock,
        service: requestServiceService,
        userService: userItindoService,
        logActivityService,
        authorizationService,
        validator: RequestServiceValidator,
      },
    },
    {
      plugin: setupService,
      options: {
        lock,
        service: setupServiceService,
        authorizationService,
        validator: SetupServiceValidator,
        logActivityService,
      },
    },
    {
      plugin: dashboard,
      options: {
        lock,
        service: dashboardService,
        authorizationService,
      },
    },
    {
      plugin: productTest,
      options: {
        lock,
        service: productTestService,
        storageService,
        validator: ProductTestValidator,
      },
    },
  ]);

  return server;
};

module.exports = app;
