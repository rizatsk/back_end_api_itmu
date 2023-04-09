const { PostCategoryProductPayloadSchema } = require("./schema");
const InvariantError = require("../../exceptions/InvariantError");

const CategoryProductValidator = {
  validatePostCategoryProductPayload: (payload) => {
    const validationResult = PostCategoryProductPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CategoryProductValidator;
