const Joi = require("joi");

const PostProductPayloadSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  typeProduct: Joi.string().required(),
  image: Joi.required(),
});

const PutProductPayloadSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  typeProduct: Joi.string().required(),
});

const PutStatusProductPayloadSchema = Joi.object({
  status: Joi.boolean().required(),
});

const PutImageProductPayloadSchema = Joi.object({
  deleteImages: Joi.string(),
  postImages: Joi.allow(),
});

const ImageHeaderSchema = Joi.object({
  "content-type": Joi.string().valid(
    "image/apng",
    "image/avif",
    "image/gif",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
  ), // refrensi mime type
}).unknown();

module.exports = {
  PostProductPayloadSchema,
  PutProductPayloadSchema,
  PutStatusProductPayloadSchema,
  PutImageProductPayloadSchema,
  ImageHeaderSchema,
};
