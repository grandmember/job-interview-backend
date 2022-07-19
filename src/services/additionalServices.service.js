const httpStatus = require('http-status');
const moment = require('moment');
const { AdditionalService, User } = require('../models');
const ApiError = require('../utils/ApiError');

const createAdditionalService = async (addImageToAdditionalServiceBody) => {
  const { name, description, price, isAvailable } = addImageToAdditionalServiceBody;

  const additionalService = await AdditionalService.create({
    name,
    description,
    price,
    isAvailable,
  });

  return additionalService;
};

const queryAdditionalServices = async (filter, options) => {
  const additionalServices = await AdditionalService.paginate(filter, options);
  return additionalServices;
};

const getAdditionalServiceById = async (additionalServiceId) => {
  return AdditionalService.findById(additionalServiceId);
};

const updateAdditionalServiceById = async (additionalServiceId, updateBody) => {
  const additionalService = await AdditionalService.findById(additionalServiceId);

  if (!additionalService) {
    throw new ApiError(httpStatus.NOT_FOUND, `Additional service with id ${additionalServiceId} not found`);
  }

  if (updateBody.name && (await AdditionalService.isAdditionalServiceNameTaken(updateBody.name, additionalServiceId))) {
    throw new ApiError(httpStatus.CONFLICT, `Additional service with name ${updateBody.name} already exists`);
  }

  Object.assign(additionalService, updateBody);
  await additionalService.save();

  return additionalService;
};

const deleteAdditionalServiceById = async (additionalServiceId) => {
  const additionalService = await AdditionalService.findById(additionalServiceId);

  if (!additionalService) {
    throw new ApiError(httpStatus.NOT_FOUND, `Additional service with id ${additionalServiceId} not found`);
  }

  await additionalService.remove();

  return additionalService;
};

const addImageToAdditionalService = async (additionalServiceId, imageUrl, imageName) => {
  const additionalService = await AdditionalService.findById(additionalServiceId);

  if (!additionalService) {
    throw new ApiError(httpStatus.NOT_FOUND, `Additional service with id ${additionalServiceId} not found`);
  }

  additionalService.images.push({
    url: imageUrl,
    name: imageName,
  });

  await additionalService.save();

  return additionalService;
};

const getImagesOfAdditionalService = async (additionalServiceId) => {
  const additionalService = await AdditionalService.findById(additionalServiceId);

  if (!additionalService) {
    throw new ApiError(httpStatus.NOT_FOUND, `Additional service with id ${additionalServiceId} not found`);
  }

  return additionalService.images;
};

const deleteImageFromAdditionalService = async (additionalServiceId, imageId) => {
  const additionalService = await AdditionalService.findById(additionalServiceId);

  if (!additionalService) {
    throw new ApiError(httpStatus.NOT_FOUND, `Additional service with id ${additionalServiceId} not found`);
  }

  const image = additionalService.images.id(imageId);

  if (!image) {
    throw new ApiError(httpStatus.NOT_FOUND, `Image with id ${imageId} not found`);
  }

  image.remove();
  await additionalService.save();

  return additionalService;
};

const bookAdditionalService = async (additionalServiceId, userId, bookingDate) => {
  const additionalService = await AdditionalService.findById(additionalServiceId);
  const user = await User.findById(userId);

  if (!additionalService) {
    throw new ApiError(httpStatus.NOT_FOUND, `Additional service with id ${additionalServiceId} not found`);
  }

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, `User with id ${userId} not found`);
  }

  if (!additionalService.isAvailable) {
    throw new ApiError(httpStatus.FORBIDDEN, `Additional service with id ${additionalServiceId} is not available right now`);
  }

  if (moment(bookingDate).isBefore(moment())) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Date ${bookingDate} is in the past`);
  }

  if (moment(bookingDate).isAfter(moment().add(1, 'year'))) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Date ${bookingDate} is too far in the future`);
  }

  user.bookedAdditionalServices.push({
    additionalServiceId,
    bookingDate,
  });
  // user.balance -= additionalService.price;
  user.balance = (user.balance - additionalService.price).toFixed(2);
  await user.save();

  return { user, additionalService };
};

module.exports = {
  createAdditionalService,
  queryAdditionalServices,
  getAdditionalServiceById,
  updateAdditionalServiceById,
  deleteAdditionalServiceById,
  addImageToAdditionalService,
  getImagesOfAdditionalService,
  bookAdditionalService,
  deleteImageFromAdditionalService,
};
