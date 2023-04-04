const InvariantError = require("../../exceptions/InvariantError");

class UserItindoHandler {
  constructor({
    service,
    tokenManager,
    validator,
    logActivityService,
    authenticationService,
  }) {
    this._service = service;
    this._tokenManager = tokenManager;
    this._validator = validator;
    this._logActivityService = logActivityService;
    this._authenticationService = authenticationService;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByTokenHandler = this.getUserByTokenHandler.bind(this);
  }

  async postUserHandler(request) {
    this._validator.validatePostUserPayload(request.payload);

    const ip = request.info._request.remoteAddress;
    const device = request.info._request.headers["user-agent"];

    const userId = await this._service.addUser(request.payload);

    const accessToken = this._tokenManager.generateAccessUserToken({
      id: userId,
    });
    const refreshToken = this._tokenManager.generateRefreshUserToken({
      id: userId,
    });

    await this._authenticationService.addRefreshToken({
      userId,
      refreshToken,
      ip,
      device,
    });
    return {
      status: "success",
      data: {
        accessToken,
        refreshToken,
      },
    };
  }

  async getUserByTokenHandler(request) {
    const { id: credentialUserId } = request.auth.credentials;

    const user = await this._service.getUserById(credentialUserId)

    return {
      status: "success",
      data: {
        user
      }
    };
  }
}

module.exports = UserItindoHandler;
