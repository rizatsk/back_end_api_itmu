class Listener {
    constructor(mailSender) {
        this._mailSender = mailSender;

        this.listenSendEmailConfirmationUser = this.listenSendEmailConfirmationUser.bind(this);
        this.listenSendEmailNewPassword = this.listenSendEmailNewPassword.bind(this);
        this.listenSendEmailNewPasswordAdmin = this.listenSendEmailNewPasswordAdmin.bind(this);
        this.listenSendEmailNewRequestService = this.listenSendEmailNewRequestService.bind(this);
        this.listenSendEmailUpdateRequestService = this.listenSendEmailUpdateRequestService.bind(this);
    }

    async listenSendEmailConfirmationUser(message) {
        try {
            const { targetEmail, contents } = JSON.parse(message.content.toString());

            const result = await this._mailSender.EmailConfirmationUser(
                targetEmail, contents
            );

            if (result.accepted) {
                console.log(`Berhasil mengirimkan email aktivasi user ${new Date()}`);
            } else {
                console.log(`Gagal mengirimkan email aktivasi user ${new Date()}`);
            }

            console.log(result);
        } catch (error) {
            console.error(error);
            console.log(`Gagal mengirimkan email aktivasi user ${new Date()}`);
        }
    }

    async listenSendEmailNewPassword(message) {
        try {
            const { targetEmail, contents } = JSON.parse(message.content.toString());

            const result = await this._mailSender.EmailNewPassword(
                targetEmail, contents
            );

            if (result.accepted) {
                console.log(`Berhasil mengirimkan email ganti password ${new Date()}`);
            } else {
                console.log(`Gagal mengirimkan email ganti password ${new Date()}`);
            }

            console.log(result);
        } catch (error) {
            console.error(error);
            console.log(`Gagal mengirimkan email ganti password ${new Date()}`);
        }
    }

    async listenSendEmailNewPasswordAdmin(message) {
        try {
            const { targetEmail, contents } = JSON.parse(message.content.toString());

            const result = await this._mailSender.EmailNewPasswordAdmin(
                targetEmail, contents
            );

            if (result.accepted) {
                console.log(`Berhasil mengirimkan email ganti password ${new Date()}`);
            } else {
                console.log(`Gagal mengirimkan email ganti password ${new Date()}`);
            }

            console.log(result);
        } catch (error) {
            console.error(error);
            console.log(`Gagal mengirimkan email ganti password ${new Date()}`);
        }
    }

    async listenSendEmailNewRequestService(message) {
        try {
            const { targetEmail, contents } = JSON.parse(message.content.toString());

            const result = await this._mailSender.EmailNewRequestService(
                targetEmail, contents
            );

            if (result.accepted) {
                console.log(`Berhasil mengirimkan email new request service ${new Date()}`);
            } else {
                console.log(`Gagal mengirimkan email new request service ${new Date()}`);
            }

            console.log(result);
        } catch (error) {
            console.error(error);
            console.log(`Gagal mengirimkan email new request service ${new Date()}`);
        }
    }

    async listenSendEmailNewRequestService(message) {
        try {
            const { targetEmail, contents } = JSON.parse(message.content.toString());

            const result = await this._mailSender.EmailNewRequestService(
                targetEmail, contents
            );

            if (result.accepted) {
                console.log(`Berhasil mengirimkan email new request service ${new Date()}`);
            } else {
                console.log(`Gagal mengirimkan email new request service ${new Date()}`);
            }

            console.log(result);
        } catch (error) {
            console.error(error);
            console.log(`Gagal mengirimkan email new request service ${new Date()}`);
        }
    }

    async listenSendEmailUpdateRequestService(message) {
        try {
            const { targetEmail, contents } = JSON.parse(message.content.toString());

            const result = await this._mailSender.EmailUpdateRequestService(
                targetEmail, contents
            );

            if (result.accepted) {
                console.log(`Berhasil mengirimkan email update request service ${new Date()}`);
            } else {
                console.log(`Gagal mengirimkan email update request service ${new Date()}`);
            }

            console.log(result);
        } catch (error) {
            console.error(error);
            console.log(`Gagal mengirimkan email update request service ${new Date()}`);
        }
    }
}

module.exports = Listener;
