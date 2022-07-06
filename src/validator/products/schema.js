const Joi = require('joi');

const PostProductPayloadSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  typeProduct: Joi.string().required(),
});

const PutProductPayloadSchema = Joi.object({
  productId: Joi.string().required(),
  name: Joi.string().required(),
  price: Joi.number().required(),
  typeProduct: Joi.string().required(),
});

const PutStatusProductPayloadSchema = Joi.object({
  productId: Joi.string().required(),
  status: Joi.boolean().required(),
});

module.exports = {PostProductPayloadSchema, PutProductPayloadSchema, PutStatusProductPayloadSchema};
