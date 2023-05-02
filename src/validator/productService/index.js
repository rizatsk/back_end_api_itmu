const { postProductServicePayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const ProductServiceValidator = {
  validatePostProductServicePayload: (payload) => {
    const validationResult = postProductServicePayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ProductServiceValidator;
