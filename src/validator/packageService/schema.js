const Joi = require('joi');

const PostPackageServicePayloadSchema = Joi.object({
  name: Joi.string().required(),
  products: Joi.array().items(Joi.string().required()),
  price: Joi.number().required(),
  typeService: Joi.string().required(),
});

const PutPackageServiceByIdPayloadSchema = Joi.object({
  packageServiceId: Joi.string().required(),
  name: Joi.string().required(),
  products: Joi.array().items(Joi.string().required()),
  price: Joi.number().required(),
  typeService: Joi.string().required(),
});

const PutStatusPackageServiceByIdPayloadSchema = Joi.object({
  packageServiceId: Joi.string().required(),
  status: Joi.boolean().required(),
});

module.exports = {PostPackageServicePayloadSchema, PutPackageServiceByIdPayloadSchema, PutStatusPackageServiceByIdPayloadSchema};
