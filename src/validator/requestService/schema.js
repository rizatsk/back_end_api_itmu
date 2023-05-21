const Joi = require('joi');

const postRequestServicePayloadSchema = Joi.object({
    device: Joi.string().required(),
    brand: Joi.string().required(),
    cracker: Joi.string().required(),
    servicing: Joi.string().required(),
    estimationPrice: Joi.number().required(),
    product: Joi.array().items(Joi.string()).required(),
    description: Joi.string(),
});

const putStatusRequestServicePayloadSchema = Joi.object({
    status: Joi.string().required(),
    realPrice: Joi.number().required(),
})

const getProductForRequestServiceSchema = Joi.object({
    device: Joi.string().required(),
    brand: Joi.string().required(),
    type: Joi.string().required(),
})


module.exports = {
    postRequestServicePayloadSchema,
    putStatusRequestServicePayloadSchema,
    getProductForRequestServiceSchema
}