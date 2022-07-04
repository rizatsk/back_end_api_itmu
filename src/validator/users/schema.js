const Joi = require('joi');

const PostAdminUserPayloadSchema = Joi.object({
  fullname: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().email({tlds: true}).required(),
  password: Joi.string().required(),
});

const PutPasswordAdminUserPayloadSchema = Joi.object({
  password: Joi.string().required(),
  userId: Joi.string(),
});

const PutAdminUserByIdPayloadSchema = Joi.object({
  userId: Joi.string(),
  fullname: Joi.string().required(),
  email: Joi.string().email({tlds: true}).required(),
});

const PutStatusAdminUserByIdPayloadSchema = Joi.object({
  userId: Joi.string().required(),
  status: Joi.boolean().required(),
});

module.exports = {PostAdminUserPayloadSchema, PutPasswordAdminUserPayloadSchema, PutAdminUserByIdPayloadSchema, PutStatusAdminUserByIdPayloadSchema};
