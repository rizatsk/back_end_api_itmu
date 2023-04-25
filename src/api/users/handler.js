const ConfigAuthorization = require("../../ConfigAuthorization");

class UsersHandler {
  constructor({ service, authentication, logActivityService, validator }) {
    this._service = service;
    this._logActivityService = logActivityService;
    this._serviceAuthentication = authentication;
    this._validator = validator;

    this.postRegisterAdminUserHandler = this.postRegisterAdminUserHandler.bind(
      this
    );
    this.getAdminUserHandler = this.getAdminUserHandler.bind(this);
    this.getAdminUserByIdHandler = this.getAdminUserByIdHandler.bind(this);
    this.putPasswordAdminUserHandler = this.putPasswordAdminUserHandler.bind(
      this
    );
    this.putAdminUserByIdHandler = this.putAdminUserByIdHandler.bind(this);
    this.putStatusAdminUserByIdHandler = this.putStatusAdminUserByIdHandler.bind(
      this
    );
  }

  async postRegisterAdminUserHandler(request, h) {
    this._validator.validatePostAdminUserPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { fullname, username, email, password } = request.payload;

    // Check only admin itindo can access this API
    await this._service.checkRoleAccessUser(
      credentialUserId,
      ConfigAuthorization.user_admin.insert
    );

    const resultUserId = await this._service.addAdminUser({
      fullname,
      username,
      email,
      password,
      createdby_user_id: credentialUserId,
    });

    await this._logActivityService.postLogActivity({
      credentialUserId,
      activity: "daftarkan admin user",
      refersId: resultUserId,
    });

    return {
      status: "success",
      message: "User berhasil didaftarkan",
    };
  }

  async getAdminUserHandler(request, h) {
    const { id: credentialUserId } = request.auth.credentials;

    // Check only admin itindo can access this API
    await this._service.verifyAdminItindoCredential(credentialUserId);
    const user_admins = await this._service.getAdminUser();

    return {
      status: "success",
      data: {
        user_admins,
      },
    };
  }

  async getAdminUserByIdHandler(request, h) {
    const { id: credentialUserId } = request.auth.credentials;

    const user_admin = await this._service.getAdminUserById(credentialUserId);
    return {
      status: "success",
      data: {
        user_admin,
      },
    };
  }

  async putPasswordAdminUserHandler(request, h) {
    await this._validator.validatePutPasswordAdminUserPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { passwordOld, passwordNew } = request.payload;

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

    return {
      status: "success",
      message: "Password admin user berhasil diperbarui",
    };
  }

  async putAdminUserByIdHandler(request, h) {
    await this._validator.validatePutAdminUserByIdPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { fullname } = request.payload;

    await this._service.editAdminUserById({
      credentialUserId,
      fullname,
    });

    await this._logActivityService.postLogActivity({
      credentialUserId,
      activity: "merubah data admin user",
      refersId: userId,
    });

    return {
      status: "success",
      message: "Admin user berhasil di update",
    };
  }

  async putStatusAdminUserByIdHandler(request, h) {
    await this._validator.validatePutStatusAdminUserByIdPayload(
      request.payload
    );

    const { id: credentialUserId } = request.auth.credentials;
    const { userId, status } = request.payload;

    await this._service.verifyAdminItindoCredential({
      credentialUserId,
    });

    await this._service.editStatusAdminUserById({
      credentialUserId,
      userId,
      status,
    });

    await this._logActivityService.postLogActivity({
      credentialUserId,
      activity: "merubah status admin user",
      refersId: userId,
    });

    return {
      status: "success",
      message: "Status admin user berhasil di update",
    };
  }
}

module.exports = UsersHandler;
