const { postRequestServicePayloadSchema,
  putStatusRequestServicePayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const RequestServiceValidator = {
  validatePostRequestServicePayload: (payload) => {
    const validationResult = postRequestServicePayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutStatusRequestServicePayload: (payload) => {
    const validationResult = putStatusRequestServicePayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = RequestServiceValidator;
