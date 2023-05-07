const Joi = require("joi");

const PostAdminUserPayloadSchema = Joi.object({
  fullname: Joi.string().min(3).max(100).required(),
  username: Joi.string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9]*$/)
    .required()
    .messages({
      "string.pattern.base":
        "Username tidak valid hanya boleh terdapat huruf dan angka",
    }),
  email: Joi.string().email({ tlds: true }).required(),
  roleId: Joi.string().max(4).required(),
});

const PutPasswordAdminUserPayloadSchema = Joi.object({
  passwordOld: Joi.string().required(),
  passwordNew: Joi.string()
    .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?=.*[a-zA-Z]).{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password tidak valid minimal 8 character, terdapat huruf besar, terdapat angka, dan terdapat character khusus",
    }),
});

const PutAdminUserByIdPayloadSchema = Joi.object({
  fullname: Joi.string().required(),
});

const PutStatusAdminUserByIdPayloadSchema = Joi.object({
  status: Joi.boolean().required(),
});

const PutRoleAdminUserByIdPayloadSchema = Joi.object({
  roleId: Joi.number().max(9998).required(),
});

module.exports = {
  PostAdminUserPayloadSchema,
  PutPasswordAdminUserPayloadSchema,
  PutAdminUserByIdPayloadSchema,
  PutStatusAdminUserByIdPayloadSchema,
  PutRoleAdminUserByIdPayloadSchema,
};
