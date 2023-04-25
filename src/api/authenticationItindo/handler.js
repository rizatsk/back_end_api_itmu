class AuthenticationItindoHandler {
  constructor({
    lock,
    authenticationService,
    userItindoService,
    logActivityService,
    tokenManager,
    validator,
  }) {
    this._lock = lock;
    this._authenticationService = authenticationService;
    this._userItindoService = userItindoService;
    this._logActivityService = logActivityService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(
      this
    );
  }

  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthenticationUserPayload(request.payload);

    const ip = request.info._request.remoteAddress;
    const device = request.info._request.headers["user-agent"];

    const { email, password } = request.payload;
    const result = await this._lock.acquire("data", async () => {
      const { userId: id } = await this._userItindoService.verifyUserCredential(
        {
          email,
          password,
        }
      );

      const accessToken = this._tokenManager.generateAccessUserToken({ id });
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

  async putAuthenticationHandler(request, h) {
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

  async deleteAuthenticationHandler(request, h) {
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._lock.acquire("data", async () => {
      await this._authenticationService.verifyRefreshToken(refreshToken);
      await this._authenticationService.deleteRefreshToken(refreshToken);
    });

    return {
      status: "success",
      message: "Refresh token berhasil dihapus",
    };
  }
}

module.exports = AuthenticationItindoHandler;
