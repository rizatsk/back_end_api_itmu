const AuthorizationUser = require('../../../config/authorization.json');

class AuthorizationHandler {
    constructor({ lock, service, validator }) {
        this._lock = lock;
        this._service = service;
        this._validator = validator;
        this._authorizationUser = AuthorizationUser['role user']

        this.getAuthorizationForInsertHandler = this.getAuthorizationForInsertHandler.bind(this);
        this.getRoleUsersHandler = this.getRoleUsersHandler.bind(this);
        this.addRoleUserHandler = this.addRoleUserHandler.bind(this);
        this.getRoleUserByIdHandler = this.getRoleUserByIdHandler.bind(this);
        this.updateRoleUserByIdHandler = this.updateRoleUserByIdHandler.bind(this);
        this.deleteRoleUserByIdHandler = this.deleteRoleUserByIdHandler.bind(this);
    }

    async getAuthorizationForInsertHandler(request) {
        const { id: credentialUserId } = request.auth.credentials;
        await this._lock.acquire("data", async () => {
            await this._service.checkRoleUser(
                credentialUserId,
                this._authorizationUser['insert role user']
            );
        });

        const authorizations = AuthorizationUser;

        return {
            status: 'success',
            data: {
                authorizations
            }
        }
    }

    async getRoleUsersHandler(request) {
        const { id: credentialUserId } = request.auth.credentials;
        const { page, limit, search } = request.query;

        await this._lock.acquire("data", async () => {
            await this._service.checkRoleUser(
                credentialUserId,
                this._authorizationUser['insert role user']
            );
        });

        const totalData = parseInt(await this._service.getCountRoleUsers(search));
        const limitPage = limit || 10;
        const pages = parseInt(page) || 1;
        const totalPage = Math.ceil(totalData / limitPage);
        const offset = (pages - 1) * limitPage;
        const roleUsers = await this._service.getRoleUsers({
            limit,
            offset,
            search
        });

        return {
            status: "success",
            data: {
                roleUsers,
            },
            totalData,
            totalPage,
            nextPage: pages + 1,
            previousPage: pages - 1,
        };
    }

    async addRoleUserHandler(request) {
        this._validator.validatePostAuthorizationPayload(request.payload);
        const { id: userId } = request.auth.credentials;
        request.payload.userId = userId;

        await this._lock.acquire("data", async () => {
            await this._service.checkRoleUser(
                userId,
                this._authorizationUser['insert role user']
            );

            await this._service.addRoleUser(request.payload);
        });

        return {
            status: 'success',
            message: 'Berhasil menambahkan role access'
        }
    }

    async getRoleUserByIdHandler(request) {
        const { roleId } = request.params;
        const { id: userId } = request.auth.credentials;

        await this._lock.acquire("data", async () => {
            await this._service.checkRoleUser(
                userId,
                this._authorizationUser['update role user']
            );
        });

        const roleUser = await this._service.getRoleUserById(roleId);

        return {
            status: 'success',
            data: {
                roleUser
            }
        }
    }

    async updateRoleUserByIdHandler(request) {
        this._validator.validatePostAuthorizationPayload(request.payload);
        const { roleId } = request.params;
        const { id: userId } = request.auth.credentials;
        request.payload.roleId = roleId;
        request.payload.userId = userId;

        await this._lock.acquire("data", async () => {
            await this._service.checkRoleUser(
                userId,
                this._authorizationUser['update role user']
            );

            await this._service.updateRoleUser(request.payload);
        });

        return {
            status: 'success',
            message: 'Berhasil update role access'
        }
    }

    async deleteRoleUserByIdHandler(request) {
        const { roleId } = request.params;
        const { id: userId } = request.auth.credentials;

        await this._lock.acquire("data", async () => {
            await this._service.checkRoleUser(
                userId,
                this._authorizationUser['update role user']
            );

            await this._service.deleteRoleUserById(roleId);
        });

        return {
            status: 'success',
            message: 'Berhasil menghapus role access'
        }
    }
}

module.exports = AuthorizationHandler