const {ImageHeaderSchema, DeleteFilePayloadSchema} = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const UploadsValidator = {
  validateImageHeaders: (headers) => {
    const validationResult = ImageHeaderSchema.validate(headers);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateDeleteImagePayload: (payload) => {
    const validationResult = DeleteFilePayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UploadsValidator;
