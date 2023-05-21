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

    async getDataHomeHandler() {
        const { imageBanner, productPromo, productSparepart } = await this._service.getDataProductForHome();

        return {
            status: 'success',
            data: { imageBanner, productPromo, productSparepart }
        }
    }
}

module.exports = DashboardHandler;