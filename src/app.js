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
const authorization = require('./api/authorization');
const AuthorizationService = require("./services/postgres/AuthorizationService");
const AuthorizationValidator = require('./validator/authorization');

// Request service
const requestService = require('./api/requestService');
const RequestServiceService = require('./services/postgres/RequestServiceService');
const RequestServiceValidator = require('./validator/requestService');

// Fee Replacement
const feeReplacement = require('./api/feeReplacement');
const FeeReplacementService = require('./services/postgres/FeeReplacementService');
const FeeReplacementValidator = require('./validator/feeReplacement');

const productService = require('./api/productService');
const ProductServiceService = require('./services/postgres/ProductServiceService');
const ProductServiceValidator = require('./validator/productService')

const app = async (pool) => {
  const lock = new Lock();
  const usersService = new UsersService({ pool });
  const authenticationService = new AuthenticationService({ pool });
  const logActivityService = new LogActivityService({ pool });
  const packageServiceService = new PackageServiceService({ pool });
  const productsService = new ProductsService({ pool });
  const storageService = new StorageService(
    path.resolve(__dirname, "public/images")
  );
  const storageImage = path.resolve(__dirname, "public/images");
  const authorizationService = new AuthorizationService({ pool });
  const userItindoService = new UserItindoService({ pool });
  const categoryProductService = new CategoryProductService({ pool });
  const requestServiceService = new RequestServiceService({ pool });
  const feeRelacementService = new FeeReplacementService({ pool });
  const productServiceService = new ProductServiceService({ pool });

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
        categoryService: categoryProductService
      },
    },
    {
      plugin: storages,
      options: {
        storageImage,
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
        logActivityService,
        authorizationService,
        validator: RequestServiceValidator,
      },
    },
    {
      plugin: feeReplacement,
      options: {
        lock,
        service: feeRelacementService,
        authorizationService,
        validator: FeeReplacementValidator,
        logActivityService,
      },
    },
    {
      plugin: productService,
      options: {
        lock,
        service: productServiceService,
        authorizationService,
        validator: ProductServiceValidator,
        logActivityService,
      },
    },
  ]);

  return server;
};

module.exports = app;
