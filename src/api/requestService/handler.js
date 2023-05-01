const AuthorizationUser = require('../../../config/authorization.json');
const InvariantError = require('../../exceptions/InvariantError');

class RequestServiceHandler {
    constructor({
        lock,
        service,
        logActivityService,
        authorizationService,
        validator,
    }) {
        this._lock = lock;
        this._service = service;
        this._logActivityService = logActivityService;
        this._authorizationService = authorizationService;
        this._validator = validator;
        this._authorizationUser = AuthorizationUser['request service'];

        this.postRequestServiceHandler = this.postRequestServiceHandler.bind(this);
        this.getRequestServiceByIdAndUserIdHandler = this.getRequestServiceByIdAndUserIdHandler.bind(this);
        this.getRequestServicesHandler = this.getRequestServicesHandler.bind(this);
        this.getRequestServiceByIdHandler = this.getRequestServiceByIdHandler.bind(this);
        this.putStatusRequestServiceByIdHandler = this.putStatusRequestServiceByIdHandler.bind(this);
    }

    async postRequestServiceHandler(request) {
        this._validator.validatePostRequestServicePayload(request.payload);
        const { id: userId } = request.auth.credentials;
        request.payload.userId = userId;

        await this._lock.acquire("data", async () => {
            const requestServiceId = await this._service.addRequestService(request.payload);

            await this._service.addTrackHistoryService({ requestServiceId, status: 'waiting confirmation', credentialUserId: 'admin-00000001' });
        });

        return {
            status: 'success',
            message: 'Berhasil menambahkan request service'
        }
    }

    async getRequestServiceByIdAndUserIdHandler(request) {
        const { id: userId } = request.auth.credentials;
        const { id: requestServiceId } = request.params;

        const requestService = await this._service.getRequestServiceByIdAndUserId(requestServiceId, userId);
        const trackHistoryService = await this._service.getTrackHistoryService(requestServiceId);

        return {
            status: 'success',
            data: {
                requestService,
                trackHistoryService
            }
        }
    }

    async getRequestServicesHandler(request) {
        const { page, limit, search_query } = request.query;
        const { id: credentialUserId } = request.auth.credentials;

        await this._lock.acquire("data", async () => {
            await this._authorizationService.checkRoleUser(
                credentialUserId,
                this._authorizationUser['get request service']
            );
        });

        const search = search_query ? search_query : "";
        const totalData = parseInt(
            await this._service.getCountRequestService(search)
        );
        const limitPage = limit || 10;
        const pages = parseInt(page) || 1;
        const totalPage = Math.ceil(totalData / limitPage);
        const offset = (pages - 1) * limitPage;
        const requestServices = await this._service.getRequestServices({
            search,
            limit: limitPage,
            offset,
        });

        return {
            status: "success",
            data: {
                requestServices,
            },
            totalData,
            totalPage,
            nextPage: pages + 1,
            previousPage: pages - 1,
        };
    }

    async getRequestServiceByIdHandler(request) {
        const { id: requestServiceId } = request.params;
        const { id: credentialUserId } = request.auth.credentials;

        await this._lock.acquire("data", async () => {
            await this._authorizationService.checkRoleUser(
                credentialUserId,
                this._authorizationUser['update request service']
            );
        });

        const requestService = await this._service.getRequestServiceById(requestServiceId);
        const trackHistoryService = await this._service.getTrackHistoryService(requestServiceId);

        return {
            status: 'success',
            data: {
                requestService,
                trackHistoryService
            }
        }
    }

    async putStatusRequestServiceByIdHandler(request) {
        this._validator.validatePutStatusRequestServicePayload(request.payload);
        const { id: requestServiceId } = request.params;
        const { id: credentialUserId } = request.auth.credentials;
        request.payload.requestServiceId = requestServiceId;
        request.payload.credentialUserId = credentialUserId;

        await this._lock.acquire("data", async () => {
            await this._authorizationService.checkRoleUser(
                credentialUserId,
                this._authorizationUser['update request service']
            );

            await this._service.updateStatusRequestServiceById(request.payload);

            await this._logActivityService.postLogActivity({
                credentialUserId,
                activity: "merubah status request service",
                refersId: requestServiceId,
            });
        });

        return {
            status: 'success',
            message: 'Berhasil update status request service'
        }
    }
}

module.exports = RequestServiceHandler;