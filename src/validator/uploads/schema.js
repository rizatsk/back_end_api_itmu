const Joi = require('joi');

const ImageHeaderSchema = Joi.object({
  'content-type': Joi.string().valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp').required(), // refrensi mime type
}).unknown();

const DeleteFilePayloadSchema = Joi.object({
  'fileName': Joi.string().required(),
});

module.exports = {ImageHeaderSchema, DeleteFilePayloadSchema};
