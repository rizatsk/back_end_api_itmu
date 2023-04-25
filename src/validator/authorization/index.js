const {
  AddRoleUserPayloadSchema,
} = require("./schema");
const InvariantError = require("../../exceptions/InvariantError");

const AuthorizationValidator = {
  validatePostAuthorizationPayload: (payload) => {
    const validationResult = AddRoleUserPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AuthorizationValidator;
