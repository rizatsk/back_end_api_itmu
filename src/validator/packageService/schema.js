const Joi = require("joi");

const PostPackageServicePayloadSchema = Joi.object({
  name: Joi.string().required(),
  // products: Joi.array().items(Joi.string().required()),
  products: Joi.string().required(),
  price: Joi.number().required(),
  image: Joi.allow(),
  typeService: Joi.string().required(),
  description: Joi.string().required(),
});

const PutPackageServiceByIdPayloadSchema = Joi.object({
  name: Joi.string().required(),
  products: Joi.array().items(Joi.string().required()),
  price: Joi.number().required(),
  typeService: Joi.string().required(),
  description: Joi.string().required(),
});

const PutStatusPackageServiceByIdPayloadSchema = Joi.object({
  status: Joi.boolean().required(),
});

const PutImagePackagePayloadSchema = Joi.object({
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
  PostPackageServicePayloadSchema,
  PutPackageServiceByIdPayloadSchema,
  PutStatusPackageServiceByIdPayloadSchema,
  PutImagePackagePayloadSchema,
  ImageHeaderSchema,
};
