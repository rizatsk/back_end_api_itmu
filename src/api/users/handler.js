const JwtDecode = require("jwt-decode");
const Authorization = require("../../../config/authorization.json");
const InvariantError = require("../../exceptions/InvariantError");
const ProducerService = require("../../services/RabbitMq/ProducerService");
const path = require('path')

class UsersHandler {
  constructor({
    lock,
    service,
    authentication,
    authorizationService,
    logActivityService,
    validator,
    tokenValidationUserService,
    storagePublic,
    tokenManager
  }) {
    this._lock = lock;
    this._service = service;
    this._logActivityService = logActivityService;
    this._serviceAuthentication = authentication;
    this._authorizationService = authorizationService;
    this._validator = validator;
    this._tokenValidationUserService = tokenValidationUserService;
    this._storagePublic = storagePublic;
    this._tokenManager = tokenManager;
    this._authorization = Authorization["user admin"];

    this.postRegisterAdminUserHandler = this.postRegisterAdminUserHandler.bind(
      this
    );
    this.getAdminUsersHandler = this.getAdminUsersHandler.bind(this);

    this.getAdminUserByTokenHandler = this.getAdminUserByTokenHandler.bind(
      this
    );
    this.putPasswordAdminUserByTokenHandler = this.putPasswordAdminUserByTokenHandler.bind(
      this
    );
    this.putAdminUserByTokenHandler = this.putAdminUserByTokenHandler.bind(
      this
    );

    this.putStatusAdminUserByIdHandler = this.putStatusAdminUserByIdHandler.bind(
      this
    );

    this.getAdminUserByIdHandler = this.getAdminUserByIdHandler.bind(this);
    this.putRoleAdminUserByIdHandler = this.putRoleAdminUserByIdHandler.bind(
      this
    );
    this.resetPassowrdAdminUserByIdHandler = this.resetPassowrdAdminUserByIdHandler.bind(
      this
    );
    this.getRoleAdminUserForEditAndInsertUserHandler = this.getRoleAdminUserForEditAndInsertUserHandler.bind(
      this
    );
    this.getAccessRoleUserByTokenHandler = this.getAccessRoleUserByTokenHandler.bind(this);

    this.requestForgetPasswordUserHandler = this.requestForgetPasswordUserHandler.bind(this);
    this.pageForgetPasswordUserHandler = this.pageForgetPasswordUserHandler.bind(this);
    this.putForgetPasswordUserByTokenHandler = this.putForgetPasswordUserByTokenHandler.bind(this);
  }

  async postRegisterAdminUserHandler(request, h) {
    this._validator.validatePostAdminUserPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    request.payload.credentialUserId = credentialUserId;

    await this._lock.acquire("data", async () => {
      // Check only admin itindo can access this API
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorization["insert user admin"]
      );

      // check role id
      await this._authorizationService.getRoleUserById(request.payload.roleId);

      const resultUserId = await this._service.addAdminUser(request.payload);

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "daftarkan admin user",
        refersId: resultUserId,
      });
    });

    return {
      status: "success",
      message: "User admin berhasil didaftarkan",
    };
  }

  async getAdminUsersHandler(request, h) {
    const { id: credentialUserId } = request.auth.credentials;
    const { page, limit, search_query } = request.query;

    await this._lock.acquire("data", async () => {
      // Check only admin itindo can access this API
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorization["get user admin"]
      );
    });

    const search = search_query ? search_query : "";
    const totalData = parseInt(await this._service.getCountAdminUser(search));
    const limitPage = limit || 10;
    const pages = parseInt(page) || 1;
    const totalPage = Math.ceil(totalData / limitPage);
    const offset = (pages - 1) * limitPage;
    const usersAdmin = await this._service.getAdminUsers({
      search,
      limit: limitPage,
      offset,
    });

    return {
      status: "success",
      data: {
        usersAdmin,
      },
      totalData,
      totalPage,
      nextPage: pages + 1,
      previousPage: pages - 1,
    };
  }

  async getAdminUserByTokenHandler(request, h) {
    const { id: credentialUserId } = request.auth.credentials;

    const userAdmin = await this._service.getAdminUserById(credentialUserId);
    return {
      status: "success",
      data: {
        userAdmin,
      },
    };
  }

  async putPasswordAdminUserByTokenHandler(request, h) {
    this._validator.validatePutPasswordAdminUserPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { passwordOld, passwordNew } = request.payload;

    await this._lock.acquire("data", async () => {
      await this._service.editPasswordAdminUser({
        credentialUserId,
        passwordOld,
        passwordNew,
      });
      await this._serviceAuthentication.deleteRefreshTokenByUserId(
        credentialUserId
      );

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "ganti password",
        refersId: credentialUserId,
      });
    });

    return {
      status: "success",
      message: "Password admin user berhasil diperbarui",
    };
  }

  async putAdminUserByTokenHandler(request, h) {
    this._validator.validatePutAdminUserByIdPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    request.payload.credentialUserId = credentialUserId;
    request.payload.userId = credentialUserId;

    await this._lock.acquire("data", async () => {
      await this._service.editAdminUserById(request.payload);

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "merubah data admin user",
        refersId: credentialUserId,
      });
    });

    return {
      status: "success",
      message: "Admin user berhasil di update",
    };
  }

  async putStatusAdminUserByIdHandler(request, h) {
    this._validator.validatePutStatusAdminUserByIdPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { userId } = request.params;
    request.payload.userId = userId;
    request.payload.credentialUserId = credentialUserId;

    if (request.payload.userId === "admin-00000001")
      throw new InvariantError("Superadmin tidak bisa di non aktifkan");

    await this._lock.acquire("data", async () => {
      // Check only admin itindo can access this API
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorization["update status user admin"]
      );

      await this._service.editStatusAdminUserById(request.payload);

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "merubah status admin user",
        refersId: userId,
      });
    });

    return {
      status: "success",
      message: "Status admin user berhasil di update",
    };
  }

  async getAdminUserByIdHandler(request) {
    const { userId } = request.params;
    const { id: credentialUserId } = request.auth.credentials;

    await this._lock.acquire("data", async () => {
      // Check only admin itindo can access this API
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorization["update user admin"]
      );
    });

    const userAdmin = await this._service.getAdminUserById(userId);

    return {
      status: "success",
      data: { userAdmin },
    };
  }

  async putRoleAdminUserByIdHandler(request) {
    this._validator.validatePutRoleAdminUserByIdPayload(request.payload);

    const { userId } = request.params;
    const { id: credentialUserId } = request.auth.credentials;
    request.payload.userId = userId;
    request.payload.credentialUserId = credentialUserId;

    await this._lock.acquire("data", async () => {
      // Check only admin itindo can access this API
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorization["update user admin"]
      );

      // check role id
      await this._authorizationService.getRoleUserById(request.payload.roleId);

      await this._service.editRoleAdminUserById(request.payload);
    });

    return {
      status: "success",
      message: "Berhasil merubah role admin",
    };
  }

  async resetPassowrdAdminUserByIdHandler(request) {
    const { id: credentialUserId } = request.auth.credentials;
    const { userId } = request.params;

    await this._lock.acquire("data", async () => {
      // Check only admin itindo can access this API
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorization["update user admin"]
      );

      await this._service.resetPassword({
        credentialUserId,
        userId,
      });

      await this._serviceAuthentication.deleteRefreshTokenByUserId(userId);

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "reset password",
        refersId: credentialUserId,
      });
    });

    return {
      status: "success",
      message: "Password admin user berhasil direset",
    };
  }

  async getRoleAdminUserForEditAndInsertUserHandler(request) {
    const { id: credentialUserId } = request.auth.credentials;
    await this._lock.acquire("data", async () => {
      // Check only admin itindo can access this API
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorization["update user admin"]
      );
    });

    const roleAdmins = await this._service.getRoleUsersForInsertOrUpdateUserAdmin();

    return {
      status: "success",
      data: {
        roleAdmins,
      },
    };
  }

  async getAccessRoleUserByTokenHandler(request) {
    const { id: userId } = request.auth.credentials;

    const access_role = await this._authorizationService.getAccessRoleUser(userId);
    return {
      status: 'success',
      data: { access_role }
    }
  }

  async requestForgetPasswordUserHandler(request) {
    const { email } = request.params;

    await this._lock.acquire("data", async () => {
      const user = await this._service.getUserByEmail(email);

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
      await ProducerService.sendMessage('export:sendEmailNewPasswordAdmin', JSON.stringify(message));
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
        `${this._storagePublic}/Pages/ForgetPasswordAdmin.html`
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
      await this._serviceAuthentication.deleteRefreshTokenByUserId(
        jwtDecode.id
      );
    });

    return {
      status: 'success',
      message: 'Berhasil mengubah password'
    }
  }
}

module.exports = UsersHandler;
