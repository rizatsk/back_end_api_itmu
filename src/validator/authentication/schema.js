const Joi = require('joi');

const PostAuthenticationPayloadSchema = Joi.object({
  parameter: Joi.string().required(),
  password: Joi.string().required(),
  ip: Joi.string().ip({
    version: [
      'ipv4',
      'ipv6',
    ],
  }).required(),
  device: Joi.string().required(),
});

const PutAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const DeleteAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {PostAuthenticationPayloadSchema, PutAuthenticationPayloadSchema, DeleteAuthenticationPayloadSchema};
