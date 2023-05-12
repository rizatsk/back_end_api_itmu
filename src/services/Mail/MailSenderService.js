const nodemailer = require("nodemailer");
const path = require("path");
const handleBars = require("handlebars");
const fs = require("fs");

class MailSenderService {
    constructor(storagePublic) {
        this._storagePublic = storagePublic;
        this._transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            tls: {
                rejectUnauthorized: false,
            },
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }

    EmailConfirmationUser(targetEmail, contents) {
        const filePath = path.resolve(
            `${this._storagePublic}/Email/EmailConfirmationUser.html`
        );
        const source = fs.readFileSync(filePath, "utf-8").toString();
        const template = handleBars.compile(source);
        const replacements = {
            name: `${contents.name}`,
            url: `${process.env.URL}/user/validation-email/${contents.token}`,
        };
        const htmlToSend = template(replacements);

        const message = {
            from: `ITMU <${process.env.SMTP_USER}>`,
            to: targetEmail,
            subject: "Verifikasi email ITMU",
            text: "Verifikasi email akun ITMU",
            html: htmlToSend,
        };

        return this._transporter.sendMail(message);
    }

    EmailNewPassword(targetEmail, contents) {
        const filePath = path.resolve(
            `${this._storagePublic}/Email/EmailNewPassword.html`
        );
        const source = fs.readFileSync(filePath, "utf-8").toString();
        const template = handleBars.compile(source);
        const replacements = {
            name: `${contents.name}`,
            url: `${process.env.URL}/user/forget-password/${contents.token}`,
        };
        const htmlToSend = template(replacements);

        const message = {
            from: `ITMU <${process.env.SMTP_USER}>`,
            to: targetEmail,
            subject: "Ganti password akun ITMU",
            text: "Ganti password akun ITMU",
            html: htmlToSend,
        };

        return this._transporter.sendMail(message);
    }

    EmailNewPasswordAdmin(targetEmail, contents) {
        const filePath = path.resolve(
            `${this._storagePublic}/Email/EmailNewPassword.html`
        );
        const source = fs.readFileSync(filePath, "utf-8").toString();
        const template = handleBars.compile(source);
        const replacements = {
            name: `${contents.name}`,
            url: `${process.env.URL}/user/admin/forget-password/${contents.token}`,
        };
        const htmlToSend = template(replacements);

        const message = {
            from: `ITMU <${process.env.SMTP_USER}>`,
            to: targetEmail,
            subject: "Ganti password akun ITMU",
            text: "Ganti password akun ITMU",
            html: htmlToSend,
        };

        return this._transporter.sendMail(message);
    }

    EmailNewPasswordAdmin(targetEmail, contents) {
        const filePath = path.resolve(
            `${this._storagePublic}/Email/EmailNewPassword.html`
        );
        const source = fs.readFileSync(filePath, "utf-8").toString();
        const template = handleBars.compile(source);
        const replacements = {
            name: `${contents.name}`,
            url: `${process.env.URL}/user/admin/forget-password/${contents.token}`,
        };
        const htmlToSend = template(replacements);

        const message = {
            from: `ITMU <${process.env.SMTP_USER}>`,
            to: targetEmail,
            subject: "Ganti password akun ITMU",
            text: "Ganti password akun ITMU",
            html: htmlToSend,
        };

        return this._transporter.sendMail(message);
    }

    EmailNewRequestService(targetEmail, contents) {
        const filePath = path.resolve(
            `${this._storagePublic}/Email/EmailNewRequestService.html`
        );
        console.log(contents.data)
        const source = fs.readFileSync(filePath, "utf-8").toString();
        const template = handleBars.compile(source);
        const replacements = {
            data: contents.data,
            url: `${process.env.URL_CMS}/request-service`,
        };
        const htmlToSend = template(replacements);

        const message = {
            from: `ITMU <${process.env.SMTP_USER}>`,
            to: targetEmail,
            subject: "Request Service",
            text: "Request Service",
            html: htmlToSend,
        };

        return this._transporter.sendMail(message);
    }

    EmailUpdateRequestService(targetEmail, contents) {
        const filePath = path.resolve(
            `${this._storagePublic}/Email/EmailUpdateRequestService.html`
        );
        console.log(contents.data)
        const source = fs.readFileSync(filePath, "utf-8").toString();
        const template = handleBars.compile(source);
        const replacements = {
            data: contents.data,
            url: `${process.env.URL_CMS}/request-service`,
        };
        const htmlToSend = template(replacements);

        const message = {
            from: `ITMU <${process.env.SMTP_USER}>`,
            to: targetEmail,
            subject: "Request Service",
            text: "Request Service",
            html: htmlToSend,
        };

        return this._transporter.sendMail(message);
    }
}

module.exports = MailSenderService;