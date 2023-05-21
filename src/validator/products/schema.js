const Joi = require("joi");

const PostProductPayloadSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  typeProduct: Joi.string().required(),
  description: Joi.string().required(),
  categoryId: Joi.string().max(50).required(),
  sparepart: Joi.boolean().required(),
  image: Joi.allow(),
});

const PutProductPayloadSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  typeProduct: Joi.string().required(),
  description: Joi.string().required(),
  categoryId: Joi.string().max(50).required(),
  sparepart: Joi.boolean().required(),
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

const PutPricePromotionProductPayloadSchema = Joi.object({
  price: Joi.number().required(),
  pricePromotion: Joi.number()
})

module.exports = {
  PostProductPayloadSchema,
  PutProductPayloadSchema,
  PutStatusProductPayloadSchema,
  PutImageProductPayloadSchema,
  ImageHeaderSchema,
  PutPricePromotionProductPayloadSchema,
};
