const JwtDecode = require("jwt-decode");
const InvariantError = require("../../exceptions/InvariantError");

class DashboardHandler {
    constructor({
        lock,
        authorizationService,
        service,
    }) {
        this._lock = lock;
        this._service = service;
        this._authorizationService = authorizationService;

        this.getDataDashboardHandler = this.getDataDashboardHandler.bind(this);
        this.getDataHomeHandler = this.getDataHomeHandler.bind(this);
    }

    async getDataDashboardHandler() {
        const amount = await this._service.getAmountDataForDashboard()
        const requestServices = await this._service.getRequestServiceLine();
        const roleUserAdmins = await this._service.getRoleUserAdminsDonuts();
        const statusRequestService = await this._service.getStatusRequestServiceBar();

        return {
            status: 'success',
            data: {
                amount,
                roleUserAdmins,
                statusRequestService,
                requestServices,
            }
        }
    }

    async getDataHomeHandler(request) {
        let userId = '';
        if (request.headers.authorization) {
            try {
                const { authorization: tokenAuthorization } = request.headers;
                const token = tokenAuthorization.split(" ");
                const { id: dataUserId } = JwtDecode(token[token.length - 1])
                userId = dataUserId
            } catch (error) {
                throw new InvariantError('Token is invalid')
            }
        }

        const { imageBanner, productPromo, productSparepart, dataUser } = await this._service.getDataProductForHome(userId);

        return {
            status: 'success',
            data: { dataUser, imageBanner, productPromo, productSparepart }
        }
    }

    async postDashboardHandler(request) {
        console.log(request.payload);

        return {
            status: 'success'
        }
    }
}

module.exports = DashboardHandler;