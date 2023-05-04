const Joi = require("joi");

const PostProductPayloadSchema = Joi.object({
  name: Joi.string().required(),
  categoryId: Joi.string().max(50).required(),
  price: Joi.number().required(),
  typeProduct: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.allow(),
  sale: Joi.boolean().required(),
  sparepart: Joi.boolean().required(),
  feeReplacementId: Joi.string().max(50).allow(''),
});

const PutProductPayloadSchema = Joi.object({
  name: Joi.string().required(),
  categoryId: Joi.string().max(50).required(),
  price: Joi.number().required(),
  typeProduct: Joi.string().required(),
  description: Joi.string().required(),
  sparepart: Joi.boolean().required(),
  feeReplacementId: Joi.string().max(50).allow(''),
});

const feeReplacementPayloadSchema = Joi.object({
  feeReplacementId: Joi.string().max(50).required(),
})

const PutStatusProductPayloadSchema = Joi.object({
  status: Joi.boolean().required(),
});

const PutSaleProductPayloadSchema = Joi.object({
  sale: Joi.boolean().required(),
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
  feeReplacementPayloadSchema,
  PutSaleProductPayloadSchema
};
