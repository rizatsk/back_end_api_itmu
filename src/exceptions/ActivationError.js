const ClientError = require('./ClientError');

class ActivationError extends ClientError {
    constructor(message) {
        super(message, 402);
        this.name = 'ActivationError';
    }
}

module.exports = ActivationError;
