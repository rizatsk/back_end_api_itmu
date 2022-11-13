class AuthenticationHandler {
  constructor(
    authenticationService,
    usersService,
    logActivityService,
    tokenManager,
    validator
  ) {
    this._authenticationService = authenticationService;
    this._usersService = usersService;
    this._logActivityService = logActivityService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthenticationAdminHandler =
      this.postAuthenticationAdminHandler.bind(this);
    this.putAuthenticationAdminHandler =
      this.putAuthenticationAdminHandler.bind(this);
    this.deleteAuthenticationAdminHandler =
      this.deleteAuthenticationAdminHandler.bind(this);
    this.getDataUserUseTokenHandler =
      this.getDataUserUseTokenHandler.bind(this);
  }

  async postAuthenticationAdminHandler(request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload);

    const { parameter, password, ip, device } = request.payload;
    const { adminId: id } = await this._usersService.verifyAdminUserCredential({
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

    const response = h.response({
      status: "success",
      message: "Authentication berhasil ditambahkan",
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationAdminHandler(request, h) {
    this._validator.validatePutAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._authenticationService.verifyRefreshToken(refreshToken);
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this._tokenManager.generateAccessToken({ id });

    const response = h.response({
      status: "success",
      message: "Access Token berhasil diperbarui",
      data: {
        accessToken,
      },
    });
    response.code(201);
    return response;
  }

  async deleteAuthenticationAdminHandler(request, h) {
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    const userId = await this._authenticationService.verifyRefreshToken(
      refreshToken
    );
    await this._authenticationService.deleteRefreshToken(refreshToken);

    await this._logActivityService.postLogActivity({
      credentialUserId: userId,
      activity: "logout",
      refersId: userId,
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
}

module.exports = AuthenticationHandler;
