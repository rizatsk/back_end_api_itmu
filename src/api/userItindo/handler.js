const InvariantError = require("../../exceptions/InvariantError");
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
  }) {
    this._lock = lock;
    this._service = service;
    this._tokenManager = tokenManager;
    this._validator = validator;
    this._logActivityService = logActivityService;
    this._authenticationService = authenticationService;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByTokenHandler = this.getUserByTokenHandler.bind(this);
    this.updateDataUserByIdHandler = this.updateDataUserByIdHandler.bind(this)
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

    const user = await this._service.getUserById(credentialUserId)
    user.profileImage = createProfileImage(user.fullname)

    return {
      status: "success",
      data: {
        user
      }
    };
  }

  async updateDataUserByIdHandler(request) {
    const { parameter, userId } = request.params;
    const dataUser = await this._service.getUserById(userId)

    await this._lock.acquire("data", async () => {
      switch (parameter) {
        case 'fullname':
          this._validator.validatePutFullnamePayload(request.payload);
          dataUser.fullname = request.payload.fullname;

          console.log(dataUser)
          await this._service.changeDataUserById(dataUser);
          break;
        case 'handphone':
          this._validator.validatePutNoPhonePayload(request.payload);
          dataUser.no_handphone = request.payload.noHandphone;

          await this._service.changeDataUserById(dataUser);
          break;
        case 'address':
          this._validator.validatePutAddressPayload(request.payload);
          dataUser.address = request.payload.address;

          await this._service.changeDataUserById(dataUser);
          break;
        default:
          throw new NotFoundError('Data user yang ingin dirubah tidak ditemukan')
      }
    });

    return {
      status: 'success',
      message: `Berhasil merubah data ${parameter} user`
    }
  }
}

module.exports = UserItindoHandler;
