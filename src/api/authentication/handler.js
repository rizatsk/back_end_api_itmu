const InvariantError = require("../../exceptions/InvariantError");

class AuthenticationHandler {
  constructor({
    lock,
    authenticationService,
    usersService,
    logActivityService,
    tokenManager,
    validator,
    userItindoService,
  }) {
    this._lock = lock;
    this._authenticationService = authenticationService;
    this._usersService = usersService;
    this._logActivityService = logActivityService;
    this._tokenManager = tokenManager;
    this._validator = validator;
    this._userItindoService = userItindoService;

    this.postAuthenticationAdminHandler = this.postAuthenticationAdminHandler.bind(
      this
    );
    this.putAuthenticationAdminHandler = this.putAuthenticationAdminHandler.bind(
      this
    );
    this.deleteAuthenticationAdminHandler = this.deleteAuthenticationAdminHandler.bind(
      this
    );
    this.getDataUserUseTokenHandler = this.getDataUserUseTokenHandler.bind(
      this
    );
    // User Itindo
    this.postAuthenticationUserHandler = this.postAuthenticationUserHandler.bind(this);
    this.putAuthenticationUserHandler = this.putAuthenticationUserHandler.bind(this);
    this.deleteAuthenticationUserHandler = this.deleteAuthenticationUserHandler.bind(this);
  }

  async postAuthenticationAdminHandler(request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload);

    const ip = request.info._request.remoteAddress;
    const device = request.info._request.headers["user-agent"];

    const { parameter, password } = request.payload;
    const result = await this._lock.acquire("data", async () => {
      const {
        adminId: id,
      } = await this._usersService.verifyAdminUserCredential({
        parameter,
        password,
      });

      const accessToken = this._tokenManager.generateAccessToken({ id });
      const refreshToken = this._tokenManager.generateRefreshToken({ id });
      await this._authenticationService.addRefreshToken({
        userId: id,
        refreshToken,
        ip,
        device,
      });

      await this._logActivityService.postLogActivity({
        credentialUserId: id,
        activity: "login",
        refersId: id,
      });

      return {
        accessToken,
        refreshToken,
      };
    });

    const response = h.response({
      status: "success",
      message: "Authentication berhasil ditambahkan",
      data: result,
    });
    response.code(201);
    return response;
  }

  async putAuthenticationAdminHandler(request, h) {
    this._validator.validatePutAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    const result = await this._lock.acquire("data", async () => {
      await this._authenticationService.verifyRefreshToken(refreshToken);
      const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

      const accessToken = this._tokenManager.generateAccessToken({ id });
      return {
        accessToken,
      };
    });

    const response = h.response({
      status: "success",
      message: "Access Token berhasil diperbarui",
      data: result,
    });
    response.code(201);
    return response;
  }

  async deleteAuthenticationAdminHandler(request, h) {
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._lock.acquire("data", async () => {
      const userId = await this._authenticationService.verifyRefreshToken(
        refreshToken
      );
      await this._authenticationService.deleteRefreshToken(refreshToken);

      await this._logActivityService.postLogActivity({
        credentialUserId: userId,
        activity: "logout",
        refersId: userId,
      });
    });

    return {
      status: "success",
      message: "Refresh token berhasil dihapus",
    };
  }

  async getDataUserUseTokenHandler(request) {
    const { id: userId } = request.auth.credentials;

    const user = await this._usersService.getAdminUserById(userId);

    return {
      status: "success",
      data: {
        user,
      },
    };
  }

  async postAuthenticationUserHandler(request, h) {
    this._validator.validatePostAuthenticationUserPayload(request.payload);

    const ip = request.info._request.remoteAddress;
    const device = request.info._request.headers["user-agent"];

    const result = await this._lock.acquire("data", async () => {
      const {
        userId: id,
      } = await this._userItindoService.verifyUserCredential(request.payload);

      const accessToken = this._tokenManager.generateAccessUserToken({
        id,
      });
      const refreshToken = this._tokenManager.generateRefreshUserToken({
        id,
      });

      await this._authenticationService.addRefreshToken({
        userId: id,
        refreshToken,
        ip,
        device,
      });

      return {
        accessToken,
        refreshToken,
      };
    });

    const response = h.response({
      status: "success",
      message: "Authentication berhasil ditambahkan",
      data: result,
    });
    response.code(201);
    return response;
  }

  async putAuthenticationUserHandler(request, h) {
    this._validator.validatePutAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    const result = await this._lock.acquire("data", async () => {
      await this._authenticationService.verifyRefreshToken(refreshToken);
      const { id } = this._tokenManager.verifyRefreshUserToken(refreshToken);

      const accessToken = this._tokenManager.generateAccessUserToken({ id });
      return {
        accessToken,
      };
    });

    const response = h.response({
      status: "success",
      message: "Access Token berhasil diperbarui",
      data: result,
    });
    response.code(201);
    return response;
  }

  async deleteAuthenticationUserHandler(request, h) {
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._lock.acquire("data", async () => {
      await this._authenticationService.verifyRefreshToken(
        refreshToken
      );
      await this._authenticationService.deleteRefreshToken(refreshToken);
    });

    return {
      status: "success",
      message: "Refresh token berhasil dihapus",
    };
  }
}

module.exports = AuthenticationHandler;
