const Joi = require('joi');

const postSetupServicePayloadSchema = Joi.object({
    name: Joi.string().required(),
    detail: Joi.string().required(),
    price: Joi.number().required(),
    type: Joi.string().required(),
});


module.exports = {
    postSetupServicePayloadSchema,
}