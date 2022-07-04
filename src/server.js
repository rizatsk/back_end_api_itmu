require('dotenv').config();

const Hapi = require('@hapi/hapi');
const ClientError = require('./exceptions/ClientError');
const Jwt = require('@hapi/jwt');

// Token Manager
const TokenManager = require('./tokenize/TokenManager');
// Log Activity Service
const LogActivityService = require('./services/LogActivityService');

// Authentication
const authentication = require('./api/authentication');
const AuthenticationService = require('./services/AuthenticationService');
const AuthenticationValidator = require('./validator/authentication');

// User
const users = require('./api/users');
const UsersService = require('./services/UsersService');
const UsersValidator = require('./validator/users');

// Package Services
const packageServices = require('./api/packageServices');
const PackageServiceService = require('./services/PackageServiceService');
const PackageServiceValidator = require('./validator/packageService');

const init = async () => {
  const usersService = new UsersService();
  const authenticationService = new AuthenticationService();
  const logActivityService = new LogActivityService();
  const packageServiceService = new PackageServiceService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Register plugin external
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // mendifiniskan strategy autentekasi jwt
  server.auth.strategy('itindosolution_jwt', 'jwt', {
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

  //  Penganganan Error Server Pada Handler
  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const {response} = request;

    if (response instanceof ClientError) {
      // membuat response baru dari response toolkit sesuai kebutuhan error handling
      const newResponse = h.response({
        status: 'fail',
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
        authenticationService,
        usersService,
        logActivityService,
        tokenManager: TokenManager,
        validator: AuthenticationValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        logActivityService,
        authentication: authenticationService,
        validator: UsersValidator,
      },
    },
    {
      plugin: packageServices,
      options: {
        service: packageServiceService,
        logActivityService,
        validator: PackageServiceValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
