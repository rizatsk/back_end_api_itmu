const {
  PostProductPayloadSchema,
  PutProductPayloadSchema,
  ImageHeaderSchema,
} = require("./schema");
const InvariantError = require("../../exceptions/InvariantError");

const ProductTestValidator = {
  validatePostProductPayload: (payload) => {
    const validationResult = PostProductPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutProductPayload: (payload) => {
    const validationResult = PutProductPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateImageHeaderSchema: (headers) => {
    const validationResult = ImageHeaderSchema.validate(headers);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ProductTestValidator;
