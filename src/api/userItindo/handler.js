const JwtDecode = require("jwt-decode");
const Authorization = require("../../../config/authorization.json");
const NotFoundError = require("../../exceptions/NotFoundError");
const ProducerService = require("../../services/RabbitMq/ProducerService");
const createProfileImage = require("../../utils/createProfileImage");
const path = require('path');
const InvariantError = require("../../exceptions/InvariantError");

class UserItindoHandler {
  constructor({
    lock,
    service,
    tokenManager,
    validator,
    logActivityService,
    authenticationService,
    authorizationService,
    tokenValidationUserService,
    storagePublic,
  }) {
    this._lock = lock;
    this._service = service;
    this._tokenManager = tokenManager;
    this._validator = validator;
    this._logActivityService = logActivityService;
    this._authenticationService = authenticationService;
    this._authorizationService = authorizationService;
    this._tokenValidationUserService = tokenValidationUserService;
    this._storagePublic = storagePublic;
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
    this.verificationEmailUserByTokenHandler = this.verificationEmailUserByTokenHandler.bind(this);
    this.requestVerificationEmailUserHandler = this.requestVerificationEmailUserHandler.bind(this);
    this.requestForgetPasswordUserHandler = this.requestForgetPasswordUserHandler.bind(this);
    this.pageForgetPasswordUserHandler = this.pageForgetPasswordUserHandler.bind(this);
    this.putForgetPasswordUserByTokenHandler = this.putForgetPasswordUserByTokenHandler.bind(this);
  }

  async postUserHandler(request) {
    this._validator.validatePostUserPayload(request.payload);

    const userId = await this._lock.acquire("data", async () => {
      const userId = await this._service.addUser(request.payload);
      return userId;
    });

    const token = this._tokenManager.generateTokenConfirmation({
      id: userId,
    });
    await this._tokenValidationUserService.addToken({ userId, token })

    // Send email
    const message = {
      targetEmail: request.payload.email,
      contents: {
        name: request.payload.fullname,
        token,
      }
    }
    await ProducerService.sendMessage('export:sendEmailConfirmationUser', JSON.stringify(message));

    return {
      status: "success",
      message: 'Registrasi anda berhasil, silahkan cek email Anda untuk konfirmasi user'
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

  async verificationEmailUserByTokenHandler(request, h) {
    const {
      token
    } = request.params;
    const jwtDecode = JwtDecode(token);

    const checkToken = await this._tokenValidationUserService.deleteToken(
      token
    );

    if (!checkToken) {
      return h.file(
        path.resolve(
          `${this._storagePublic}/Pages/ConfirmationUserFailed.html`
        )
      );
    }

    await this._service.updateEmailVerifiedUserById(jwtDecode.id);

    return h.file(
      path.resolve(
        `${this._storagePublic}/Pages/ConfirmationUserSuccess.html`
      )
    );
  }

  async requestVerificationEmailUserHandler(request) {
    const { email } = request.params;

    await this._lock.acquire("data", async () => {
      const user = await this._service.getUserByEmail(email);
      if (user.email_verified) throw new InvariantError('Akun sudah di aktivasi');

      const token = this._tokenManager.generateTokenConfirmation({
        id: user.user_id,
      });

      await this._tokenValidationUserService.addToken({ userId: user.user_id, token })

      // Send email
      const message = {
        targetEmail: user.email,
        contents: {
          name: user.fullname,
          token,
        }
      }
      await ProducerService.sendMessage('export:sendEmailConfirmationUser', JSON.stringify(message));
    });

    return {
      status: "success",
      message: "Berhasil kirimkan link untuk aktivasi akun",
    };
  }

  async requestForgetPasswordUserHandler(request) {
    const { email } = request.params;

    await this._lock.acquire("data", async () => {
      const user = await this._service.getUserByEmail(email);
      if (!user.email_verified) throw new InvariantError('Akun belum di aktivasi');

      const token = this._tokenManager.generateTokenConfirmation({
        id: user.user_id,
      });

      await this._tokenValidationUserService.addToken({ userId: user.user_id, token })

      // Send email
      const message = {
        targetEmail: user.email,
        contents: {
          name: user.fullname,
          token,
        }
      }
      await ProducerService.sendMessage('export:sendEmailNewPassword', JSON.stringify(message));
    });

    return {
      status: "success",
      message: "Berhasil kirimkan link untuk create new password",
    };
  }

  async pageForgetPasswordUserHandler(request, h) {
    const {
      token
    } = request.params;

    const userId = await this._tokenValidationUserService.getUserIdByToken(
      token
    );

    if (!userId) {
      return h.file(
        path.resolve(
          `${this._storagePublic}/Pages/ForgetPasswordInvalid.html`
        )
      );
    }

    return h.file(
      path.resolve(
        `${this._storagePublic}/Pages/ForgetPassword.html`
      )
    );
  }

  async putForgetPasswordUserByTokenHandler(request) {
    this._validator.validatePutPasswordBytokenPayload(request.payload);

    const { token, passwordNew } = request.payload;
    const jwtDecode = JwtDecode(token);

    await this._lock.acquire("data", async () => {
      const checkToken = await this._tokenValidationUserService.deleteToken(
        token
      );

      if (!checkToken) {
        throw new InvariantError('Link sudah tidak berlaku lagi');
      }

      await this._service.updatePasswordForForgotPassword({ userId: jwtDecode.id, passwordNew })
      await this._authenticationService.deleteRefreshTokenByUserId(jwtDecode.id);
    });

    return {
      status: 'success',
      message: 'Berhasil mengubah password'
    }
  }
}

module.exports = UserItindoHandler;
