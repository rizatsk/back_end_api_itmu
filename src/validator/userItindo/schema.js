const Joi = require("joi");

const PostUserPayloadSchema = Joi.object({
  fullname: Joi.string().required(),
  noHandphone: Joi.string()
    .regex(/^08\d{8,11}$/)
    .required()
    .messages({
      regex: "No handphone tidak valid",
    }),
  email: Joi.string().email({ tlds: true }).required(),
  password: Joi.string().required(),
});

module.exports = {
  PostUserPayloadSchema,
};
