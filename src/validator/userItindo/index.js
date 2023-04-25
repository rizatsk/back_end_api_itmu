const { PostUserPayloadSchema,
  PutFullnameUserPayloadSchema,
  PutNoPhoneUserPayloadSchema,
  PutAddressUserPayloadSchema } = require("./schema");
const InvariantError = require("../../exceptions/InvariantError");

const UserItindoValidator = {
  validatePostUserPayload: (payload) => {
    const validationResult = PostUserPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutFullnamePayload: (payload) => {
    const validationResult = PutFullnameUserPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutNoPhonePayload: (payload) => {
    const validationResult = PutNoPhoneUserPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutAddressPayload: (payload) => {
    const validationResult = PutAddressUserPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UserItindoValidator;
