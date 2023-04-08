const Joi = require("joi");

const PostUserPayloadSchema = Joi.object({
  fullname: Joi.string().required(),
  noHandphone: Joi.string()
    .regex(/^08\d{8,11}$/)
    .required()
    .messages({
      "string.pattern.base": "No handphone tidak valid",
    }),
  email: Joi.string().email({ tlds: true }).required(),
  password: Joi.string()
    .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?=.*[a-zA-Z]).{8,}$/)
    .required()
    .messages({
      "string.pattern.base": "Password tidak valid minimal 8 character, 1 huruf besar, 1 angka, dan 1 character khusus",
    }),
});

module.exports = {
  PostUserPayloadSchema,
};
