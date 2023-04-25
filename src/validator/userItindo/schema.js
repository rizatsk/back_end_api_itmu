const Joi = require("joi");

const PostUserPayloadSchema = Joi.object({
  fullname: Joi.string().min(3).max(100).required(),
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

const PutFullnameUserPayloadSchema = Joi.object({
  fullname: Joi.string().min(3).max(100).required(),
});

const PutNoPhoneUserPayloadSchema = Joi.object({
  noHandphone: Joi.string()
    .regex(/^08\d{8,11}$/)
    .required()
    .messages({
      "string.pattern.base": "No handphone tidak valid",
    }),
});

const PutAddressUserPayloadSchema = Joi.object({
  address: Joi.object({
    label: Joi.string().min(3).max(50).required(),
    provinsi: Joi.string().min(3).max(100).required(),
    kota: Joi.string().min(3).max(100).required(),
    kecamatan: Joi.string().min(3).max(100).required(),
    kelurahan: Joi.string().min(3).max(100).required(),
    alamat: Joi.string().min(3).required(),
  }),
});

module.exports = {
  PostUserPayloadSchema,
  PutFullnameUserPayloadSchema,
  PutNoPhoneUserPayloadSchema,
  PutAddressUserPayloadSchema
};
