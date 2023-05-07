const {
  PostUserPayloadSchema,
  PutFullnameUserPayloadSchema,
  PutNoPhoneUserPayloadSchema,
  PutAddressUserPayloadSchema,
  PutPasswordUserPayloadSchema,
  PutStatusUserByIdPayloadSchema,
} = require("./schema");
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
  validatePutPasswordPayload: (payload) => {
    const validationResult = PutPasswordUserPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutStatusPayload: (payload) => {
    const validationResult = PutStatusUserByIdPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UserItindoValidator;
