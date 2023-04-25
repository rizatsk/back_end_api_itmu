const Joi = require("joi");

const AddRoleUserPayloadSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    accessRole: Joi.array().items(Joi.string()).required(),
});

module.exports = {
    AddRoleUserPayloadSchema,
}