const ClientError = require("./ClientError");

class LoginAttemptsError extends ClientError {
  constructor(message) {
    super(message, 429);
    this.name = "LoginAttemptsError";
    this.message = message;
  }
}

module.exports = LoginAttemptsError;
