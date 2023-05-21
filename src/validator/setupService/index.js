const { postSetupServicePayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const SetupServiceValidator = {
  validatePostSetupServicePayload: (payload) => {
    const validationResult = postSetupServicePayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = SetupServiceValidator;
