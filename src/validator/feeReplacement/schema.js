const Joi = require('joi');

const postFeeReplacementPayloadSchema = Joi.object({
    name: Joi.string().min(3).max(100),
    price: Joi.number().required(),
});

module.exports = {
    postFeeReplacementPayloadSchema
}