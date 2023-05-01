const { postFeeReplacementPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const FeeReplacementValidator = {
  validatePostFeeReplacementPayload: (payload) => {
    const validationResult = postFeeReplacementPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = FeeReplacementValidator;
