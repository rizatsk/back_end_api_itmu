const Joi = require("joi");

const PostCategoryProductPayloadSchema = Joi.object({
  parentId: Joi.string().max(50),
  name: Joi.string().max(100).required(),
});

const PutStatusCategoryProductPayloadSchema = Joi.object({
  status: Joi.boolean().required(),
});

module.exports = {
  PostCategoryProductPayloadSchema,
  PutStatusCategoryProductPayloadSchema,
};
