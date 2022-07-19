const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createAdditionalService = {
  body: Joi.object().keys({
    name: Joi.string().required().min(1).max(50),
    description: Joi.string().min(0).max(500),
    price: Joi.string().required(), // currency validation is handled in the model
    isAvailable: Joi.boolean(),
    images: Joi.array().items(
      Joi.object().keys({
        url: Joi.string().required().min(1).max(1000),
        name: Joi.string().min(1).max(1000),
      })
    ),
  }),
};

const getAdditionalServices = {
  query: Joi.object().keys({
    name: Joi.string(),
    price: Joi.number(),
    isAvailable: Joi.boolean(),

    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getAdditionalService = {
  params: Joi.object().keys({
    additionalServiceId: Joi.custom(objectId),
  }),
};

const updateAdditionalService = {
  params: Joi.object().keys({
    additionalServiceId: Joi.custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string(),
    price: Joi.number(),
    isAvailable: Joi.boolean(),
  }),
};

const deleteAdditionalService = {
  params: Joi.object().keys({
    additionalServiceId: Joi.custom(objectId),
  }),
};

const getImagesOfAdditionalService = {
  params: Joi.object().keys({
    additionalServiceId: Joi.custom(objectId),
  }),
};

const bookAdditionalService = {
  params: Joi.object().keys({
    additionalServiceId: Joi.custom(objectId),
  }),
  body: Joi.object().keys({
    bookingDate: Joi.date().required(),
  }),
};

module.exports = {
  createAdditionalService,
  getAdditionalServices,
  getAdditionalService,
  updateAdditionalService,
  deleteAdditionalService,
  getImagesOfAdditionalService,
  bookAdditionalService,
};
