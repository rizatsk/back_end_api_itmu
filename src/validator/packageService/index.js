const {
  PostPackageServicePayloadSchema,
  PutPackageServiceByIdPayloadSchema,
  PutStatusPackageServiceByIdPayloadSchema,
  PutImagePackagePayloadSchema,
  ImageHeaderSchema,
} = require("./schema");
const InvariantError = require("../../exceptions/InvariantError");

const PackageServiceValidator = {
  validatePostPackageServicePayload: (payload) => {
    const validationResult = PostPackageServicePayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutPackageServiceByIdPayload: (payload) => {
    const validationResult = PutPackageServiceByIdPayloadSchema.validate(
      payload
    );

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutStatusPackageServiceByIdPayload: (payload) => {
    const validationResult = PutStatusPackageServiceByIdPayloadSchema.validate(
      payload
    );

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutIamgesPackagePayload: (payload) => {
    const validationResult = PutImagePackagePayloadSchema.validate(payload);

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

module.exports = PackageServiceValidator;
