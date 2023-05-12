require('dotenv').config();
const path = require("path");
const amqp = require('amqplib');
const MailSenderService = require('./services/Mail/MailSenderService');
const Listener = require('./services/RabbitMq/Listener');

const init = async () => {
    // Message broker
    const storagePublic = path.resolve(__dirname, "public");
    const mailSender = new MailSenderService(storagePublic);
    const listener = new Listener(mailSender);
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();

    await channel.assertQueue('export:sendEmailConfirmationUser', {
        durable: true,
    });
    await channel.assertQueue('export:sendEmailNewPassword', {
        durable: true,
    });
    await channel.assertQueue('export:sendEmailNewPasswordAdmin', {
        durable: true,
    });
    await channel.assertQueue('export:sendEmailNewRequestService', {
        durable: true,
    });
    await channel.assertQueue('export:sendEmailUpdateRequestService', {
        durable: true,
    });

    channel.consume('export:sendEmailConfirmationUser', listener.listenSendEmailConfirmationUser, { noAck: true });
    channel.consume('export:sendEmailNewPassword', listener.listenSendEmailNewPassword, { noAck: true });
    channel.consume('export:sendEmailNewPasswordAdmin', listener.listenSendEmailNewPasswordAdmin, { noAck: true });
    channel.consume('export:sendEmailNewRequestService', listener.listenSendEmailNewRequestService, { noAck: true });
    channel.consume('export:sendEmailUpdateRequestService', listener.listenSendEmailUpdateRequestService, { noAck: true });
};

init();
