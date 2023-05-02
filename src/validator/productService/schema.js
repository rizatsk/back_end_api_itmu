const Joi = require('joi');

const postProductServicePayloadSchema = Joi.object({
    name: Joi.string().required(),
    service: Joi.string().required(),
    price: Joi.number().required(),
});


module.exports = {
    postProductServicePayloadSchema,
}