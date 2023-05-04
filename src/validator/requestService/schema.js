const Joi = require('joi');

const postRequestServicePayloadSchema = Joi.object({
    device: Joi.string().required(),
    brand: Joi.string().required(),
    cracker: Joi.string().required(),
    servicing: Joi.string().required(),
    estimationPrice: Joi.number().required(),
});

const putStatusRequestServicePayloadSchema = Joi.object({
    status: Joi.string().required(),
    realPrice: Joi.number().required(),
})


module.exports = {
    postRequestServicePayloadSchema,
    putStatusRequestServicePayloadSchema
}