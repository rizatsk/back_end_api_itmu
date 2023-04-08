const Joi = require("joi");

const PostAuthenticationPayloadSchema = Joi.object({
  parameter: Joi.string().required(),
  password: Joi.string().required(),
});

const PutAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const DeleteAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const PostAuthenticationUserPayloadSchema = Joi.object({
  email: Joi.string().email({ tlds: true }).required(),
  password: Joi.string().required(),
});

module.exports = {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
  PostAuthenticationUserPayloadSchema,
};
