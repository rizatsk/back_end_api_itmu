const AuthorizationUser = require('../../../config/authorization.json');
const DeviceServiceRequest = require('../../../config/serviceRequest.json');
const ProducerService = require('../../services/RabbitMq/ProducerService');

class RequestServiceHandler {
    constructor({
        lock,
        service,
        userService,
        logActivityService,
        authorizationService,
        validator,
    }) {
        this._lock = lock;
        this._service = service;
        this._userService = userService;
        this._logActivityService = logActivityService;
        this._authorizationService = authorizationService;
        this._validator = validator;
        this._authorizationUser = AuthorizationUser['request service'];

        this.getDataForRequestServiceHandler = this.getDataForRequestServiceHandler.bind(this);
        this.postRequestServiceHandler = this.postRequestServiceHandler.bind(this);
        this.getRequestServiceByTokenUserHandler = this.getRequestServiceByTokenUserHandler.bind(this);
        this.getRequestServiceByIdAndUserIdHandler = this.getRequestServiceByIdAndUserIdHandler.bind(this);

        this.getRequestServicesHandler = this.getRequestServicesHandler.bind(this);
        this.getRequestServiceByIdHandler = this.getRequestServiceByIdHandler.bind(this);
        this.getTrackHistoryServicesByServiceIdHandler = this.getTrackHistoryServicesByServiceIdHandler.bind(this);
        this.putStatusAndRealPriceRequestServiceByIdHandler = this.putStatusAndRealPriceRequestServiceByIdHandler.bind(this);
    }

    async getDataForRequestServiceHandler() {
        const devices = DeviceServiceRequest;
        const deviceServices = await this._service.getProductServicesForRequestService();

        return {
            status: 'success',
            data: {
                devices,
                deviceServices
            }
        }
    }

    async postRequestServiceHandler(request) {
        this._validator.validatePostRequestServicePayload(request.payload);
        const { id: userId } = request.auth.credentials;
        request.payload.userId = userId;

        await this._lock.acquire("data", async () => {
            const user = await this._userService.getUserById(userId);
            const requestServiceId = await this._service.addRequestService(request.payload);

            await this._service.addTrackHistoryService({ requestServiceId, status: 'waiting confirmation', credentialUserId: 'admin-00000001' });

            // Send email
            const message = {
                targetEmail: process.env.MAIL_TO,
                contents: {
                    data: {
                        fullname: user.fullname,
                        email: user.email,
                        handphone: user.no_handphone,
                        cracker: request.payload.cracker,
                        device: request.payload.device,
                        brand: request.payload.brand,
                        servicing: request.payload.servicing,
                    }
                }
            }
            await ProducerService.sendMessage('export:sendEmailNewRequestService', JSON.stringify(message));
        });

        return {
            status: 'success',
            message: 'Berhasil menambahkan request service'
        }
    }

    async getRequestServiceByTokenUserHandler(request) {
        const { page, limit, status_query } = request.query;
        const { id: userId } = request.auth.credentials;

        const status = status_query ? status_query : "";
        const totalData = parseInt(
            await this._service.getCountRequestServiceForUser(userId, status)
        );
        const limitPage = limit || 10;
        const pages = parseInt(page) || 1;
        const totalPage = Math.ceil(totalData / limitPage);
        const offset = (pages - 1) * limitPage;
        const requestServices = await this._service.getRequestServicesForUser({
            userId,
            status,
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

        return {
            status: 'success',
            data: {
                requestService,
            }
        }
    }

    async getTrackHistoryServicesByServiceIdHandler(request) {
        const { id: requestServiceId } = request.params;
        const { id: credentialUserId } = request.auth.credentials;

        await this._lock.acquire("data", async () => {
            await this._authorizationService.checkRoleUser(
                credentialUserId,
                this._authorizationUser['update request service']
            );
        });

        const trackHistoryService = await this._service.getTrackHistoryServiceForCms(requestServiceId);

        return {
            status: 'success',
            data: {
                trackHistoryService
            }
        }
    }

    async putStatusAndRealPriceRequestServiceByIdHandler(request) {
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

            await this._service.updateStatusAndRealPriceRequestServiceById(request.payload);

            await this._logActivityService.postLogActivity({
                credentialUserId,
                activity: "merubah status dan real price request service",
                refersId: requestServiceId,
            });

            const user = await this._service.getUserByRequestServiceId(request.payload.requestServiceId);
            // Send email
            const message = {
                targetEmail: user.email,
                contents: {
                    data: {
                        fullname: user.fullname,
                        cracker: user.cracker,
                        device: user.device,
                        brand: user.brand,
                        servicing: user.servicing,
                        status: user.status,
                        estimation_price: user.estimation_price,
                        real_price: user.real_price,
                    }
                }
            }

            await ProducerService.sendMessage('export:sendEmailUpdateRequestService', JSON.stringify(message));

        });

        return {
            status: 'success',
            message: 'Berhasil update status request service'
        }
    }
}

module.exports = RequestServiceHandler;