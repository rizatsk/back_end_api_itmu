const {
  PostProductPayloadSchema,
  PutProductPayloadSchema,
  PutStatusProductPayloadSchema,
  PutImageProductPayloadSchema,
  ImageHeaderSchema,
  PutPricePromotionProductPayloadSchema
} = require("./schema");
const InvariantError = require("../../exceptions/InvariantError");

const ProductsValidator = {
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
  validatePutStatusProductPayload: (payload) => {
    const validationResult = PutStatusProductPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutPricePromotionProductPayload: (payload) => {
    const validationResult = PutPricePromotionProductPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutIamgesProductPayload: (payload) => {
    const validationResult = PutImageProductPayloadSchema.validate(payload);

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

module.exports = ProductsValidator;
