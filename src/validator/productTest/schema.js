const Joi = require("joi");

const PostProductPayloadSchema = Joi.object({
  name: Joi.string().required(),
  buy_price: Joi.number().required(),
  sale_price: Joi.number().required(),
  stock: Joi.string().required(),
  foto_product: Joi.object({
    hapi: Joi.object({
      filename: Joi.string().required().messages({
        "string.empty":
          "Foto resto file must be media",
      }),
      headers: Joi.allow().required(),
    }),
    _readableState: Joi.allow(),
    _events: Joi.allow(),
    _eventsCount: Joi.allow(),
    _maxListeners: Joi.allow(),
    _data: Joi.allow(),
    _position: Joi.allow(),
    _encoding: Joi.allow(),
  }).messages({
    "object.base":
      "Foto resto file must be media",
  }),
});

const PutProductPayloadSchema = Joi.object({
  name: Joi.string().required(),
  buy_price: Joi.number().required(),
  sale_price: Joi.number().required(),
  stock: Joi.string().required(),
  foto_product: Joi.allow(),
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
  ImageHeaderSchema,
}
