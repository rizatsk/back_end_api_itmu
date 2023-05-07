const Authorization = require("../../../config/authorization.json");
const NotFoundError = require("../../exceptions/NotFoundError");
const createProfileImage = require("../../utils/createProfileImage");

class UserItindoHandler {
  constructor({
    lock,
    service,
    tokenManager,
    validator,
    logActivityService,
    authenticationService,
    authorizationService,
  }) {
    this._lock = lock;
    this._service = service;
    this._tokenManager = tokenManager;
    this._validator = validator;
    this._logActivityService = logActivityService;
    this._authenticationService = authenticationService;
    this._authorizationService = authorizationService;
    this._authorization = Authorization["user"];

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByTokenHandler = this.getUserByTokenHandler.bind(this);
    this.updateDataUserByTokenHandler = this.updateDataUserByTokenHandler.bind(
      this
    );
    this.updatePasswordUserByTokenHandler = this.updatePasswordUserByTokenHandler.bind(
      this
    );
    this.getUsersHandler = this.getUsersHandler.bind(this);
    this.updateStatusUserByIdHandler = this.updateStatusUserByIdHandler.bind(
      this
    );
  }

  async postUserHandler(request) {
    this._validator.validatePostUserPayload(request.payload);

    const ip = request.info._request.remoteAddress;
    const device = request.info._request.headers["user-agent"];

    const userId = await this._lock.acquire("data", async () => {
      const userId = await this._service.addUser(request.payload);
      return userId;
    });

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

    const user = await this._service.getUserById(credentialUserId);
    user.profileImage = await createProfileImage(user.fullname);

    return {
      status: "success",
      data: {
        user,
      },
    };
  }

  async updateDataUserByTokenHandler(request) {
    const { parameter } = request.params;
    const { id: userId } = request.auth.credentials;

    const dataUser = await this._service.getUserById(userId);

    await this._lock.acquire("data", async () => {
      switch (parameter) {
        case "fullname":
          this._validator.validatePutFullnamePayload(request.payload);
          dataUser.fullname = request.payload.fullname;

          await this._service.changeDataUserById(dataUser);
          break;
        case "handphone":
          this._validator.validatePutNoPhonePayload(request.payload);
          dataUser.no_handphone = request.payload.noHandphone;

          await this._service.changeDataUserById(dataUser);
          break;
        case "address":
          this._validator.validatePutAddressPayload(request.payload);
          dataUser.address = request.payload.address;

          await this._service.changeDataUserById(dataUser);
          break;
        default:
          throw new NotFoundError(
            "Data user yang ingin dirubah tidak ditemukan"
          );
      }
    });

    return {
      status: "success",
      message: `Berhasil merubah data ${parameter} user`,
    };
  }

  async updatePasswordUserByTokenHandler(request) {
    this._validator.validatePutPasswordPayload(request.payload);

    const { id: userId } = request.auth.credentials;
    request.payload.userId = userId;

    await this._lock.acquire("data", async () => {
      await this._service.editPasswordUser(request.payload);
      await this._authenticationService.deleteRefreshTokenByUserId(userId);
    });

    return {
      status: "success",
      message: "Berhasil mengganti password user",
    };
  }

  async getUsersHandler(request) {
    const { id: credentialUserId } = request.auth.credentials;
    const { page, limit, search_query } = request.query;

    await this._lock.acquire("data", async () => {
      // Check only admin itindo can access this API
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorization["get user"]
      );
    });

    const search = search_query ? search_query : "";
    const totalData = parseInt(await this._service.getCountUsers(search));
    const limitPage = limit || 10;
    const pages = parseInt(page) || 1;
    const totalPage = Math.ceil(totalData / limitPage);
    const offset = (pages - 1) * limitPage;
    const users = await this._service.getUsers({
      search,
      limit: limitPage,
      offset,
    });

    return {
      status: "success",
      data: {
        users,
      },
      totalData,
      totalPage,
      nextPage: pages + 1,
      previousPage: pages - 1,
    };
  }

  async updateStatusUserByIdHandler(request) {
    this._validator.validatePutStatusPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { id: userId } = request.params;
    request.payload.userId = userId;

    await this._lock.acquire("data", async () => {
      // Check only admin itindo can access this API
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorization["update user"]
      );

      await this._service.updateStatusUserById(request.payload);
    });

    return {
      status: "success",
      message: "Berhasil update status user",
    };
  }
}

module.exports = UserItindoHandler;
