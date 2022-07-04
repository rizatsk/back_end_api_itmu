const {PostAdminUserPayloadSchema, PutPasswordAdminUserPayloadSchema, PutAdminUserByIdPayloadSchema, PutStatusAdminUserByIdPayloadSchema} = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const UsersValidator = {
  validatePostAdminUserPayload: (payload) => {
    const validationResult = PostAdminUserPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutPasswordAdminUserPayload: (payload) => {
    const validationResult = PutPasswordAdminUserPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutAdminUserByIdPayload: (payload) => {
    const validationResult = PutAdminUserByIdPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutStatusAdminUserByIdPayload: (payload) => {
    const validationResult = PutStatusAdminUserByIdPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UsersValidator;
