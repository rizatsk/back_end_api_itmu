const { PostCategoryProductPayloadSchema, PutStatusCategoryProductPayloadSchema } = require("./schema");
const InvariantError = require("../../exceptions/InvariantError");

const CategoryProductValidator = {
  validatePostCategoryProductPayload: (payload) => {
    const validationResult = PostCategoryProductPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutStatusCategoryProductPayload: (payload) => {
    const validationResult = PutStatusCategoryProductPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CategoryProductValidator;
