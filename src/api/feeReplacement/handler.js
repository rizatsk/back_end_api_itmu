const AuthorizationUser = require('../../../config/authorization.json');
const InvariantError = require('../../exceptions/InvariantError');

class FeeReplacementHandler {
    constructor({
        lock,
        service,
        authorizationService,
        validator,
        logActivityService,
    }) {
        this._lock = lock;
        this._service = service;
        this._authorizationService = authorizationService;
        this._validator = validator;
        this._logActivityService = logActivityService;
        this._authorizationUser = AuthorizationUser['fee replacement'];

        this.postFeeReplacementHandler = this.postFeeReplacementHandler.bind(this);
        this.getFeeReplacementsHandler = this.getFeeReplacementsHandler.bind(this);
        this.getFeeReplacementForProductHandler = this.getFeeReplacementForProductHandler.bind(this);
        this.getFeeReplacementByIdHandler = this.getFeeReplacementByIdHandler.bind(this);
        this.updateFeeReplacementByIdHandler = this.updateFeeReplacementByIdHandler.bind(this);
        this.deleteFeeReplacementByIdHandler = this.deleteFeeReplacementByIdHandler.bind(this);
    }

    async postFeeReplacementHandler(request) {
        this._validator.validatePostFeeReplacementPayload(request.payload);

        const { id: credentialUserId } = request.auth.credentials;
        await this._lock.acquire("data", async () => {
            await this._authorizationService.checkRoleUser(
                credentialUserId,
                this._authorizationUser['insert fee replacement']
            );


            const feeReplacementId = await this._service.addFeeReplacement(
                request.payload
            );

            await this._logActivityService.postLogActivity({
                credentialUserId,
                activity: "menambahkan fee replacement",
                refersId: feeReplacementId,
            });
        });

        return {
            status: "success",
            message: "Berhasil menambahkan fee replacement"
        };
    }

    async getFeeReplacementsHandler(request) {
        const { page, limit, search } = request.query;

        const { id: credentialUserId } = request.auth.credentials;
        await this._lock.acquire("data", async () => {
            await this._authorizationService.checkRoleUser(
                credentialUserId,
                this._authorizationUser['get fee replacement']
            );
        });

        const totalData = parseInt(await this._service.getCountFeeReplacements(search));
        const limitPage = limit || 10;
        const pages = parseInt(page) || 1;
        const totalPage = Math.ceil(totalData / limitPage);
        const offset = (pages - 1) * limitPage;
        const feeReplacements = await this._service.getFeeReplacements({
            limit: limitPage,
            offset,
            search
        });

        return {
            status: "success",
            data: {
                feeReplacements,
            },
            totalData,
            totalPage,
            nextPage: pages + 1,
            previousPage: pages - 1,
        };
    }

    async getFeeReplacementForProductHandler() {
        const feeReplacements = await this._service.getFeeReplacementsForProduct();

        return {
            status: 'success',
            data: { feeReplacements }
        }
    }

    async getFeeReplacementByIdHandler(request) {
        const { id } = request.params;

        const { id: credentialUserId } = request.auth.credentials;
        await this._lock.acquire("data", async () => {
            await this._authorizationService.checkRoleUser(
                credentialUserId,
                this._authorizationUser['update fee replacement']
            );
        });

        const feeReplacement = await this._service.getFeeReplacementById(id);

        return {
            status: 'success',
            data: { feeReplacement }
        }
    }

    async updateFeeReplacementByIdHandler(request) {
        this._validator.validatePostFeeReplacementPayload(request.payload);

        const { id } = request.params;
        request.payload.feeReplacementId = id;

        const { id: credentialUserId } = request.auth.credentials;
        await this._lock.acquire("data", async () => {
            await this._authorizationService.checkRoleUser(
                credentialUserId,
                this._authorizationUser['update fee replacement']
            );

            await this._service.putFeeReplacementById(request.payload);

            await this._logActivityService.postLogActivity({
                credentialUserId,
                activity: "merubah fee replacement",
                refersId: id,
            });
        });


        return {
            status: 'success',
            message: 'Berhasil update fee replacement'
        }
    }


    async deleteFeeReplacementByIdHandler(request) {
        const { id: feeReplacementId } = request.params;

        const { id: credentialUserId } = request.auth.credentials;
        await this._lock.acquire("data", async () => {
            await this._authorizationService.checkRoleUser(
                credentialUserId,
                this._authorizationUser['delete fee replacement']
            );

            await this._service.deleteFeeNameReplacement(feeReplacementId);

            await this._logActivityService.postLogActivity({
                credentialUserId,
                activity: "menghapus fee replacement",
                refersId: feeReplacementId,
            });
        });


        return {
            status: 'success',
            message: 'Berhasil menghapus fee replacement'
        }
    }
}

module.exports = FeeReplacementHandler;