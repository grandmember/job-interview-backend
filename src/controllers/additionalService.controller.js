const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { additionalServiceService } = require('../services');

const createAdditionalService = catchAsync(async (req, res) => {
  const newAdditionalService = await additionalServiceService.createAdditionalService(req.body);

  return res.status(httpStatus.CREATED).send(newAdditionalService);
});

const getAdditionalServices = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'price', 'isAvailable']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await additionalServiceService.queryAdditionalServices(filter, options);

  return res.send(result);
});

const getAdditionalService = catchAsync(async (req, res) => {
  const additionalService = await additionalServiceService.getAdditionalServiceById(req.params.additionalServiceId);

  if (!additionalService) {
    throw new ApiError(httpStatus.NOT_FOUND, `Additional service with id ${req.params.additionalServiceId} not found`);
  }

  return res.status(httpStatus.OK).send(additionalService);
});

const updateAdditionalService = catchAsync(async (req, res) => {
  const updatedAdditionalService = await additionalServiceService.updateAdditionalServiceById(
    req.params.additionalServiceId,
    req.body
  );

  if (!updatedAdditionalService) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Additional service with id ${req.params.additionalServiceId} could not be updated`
    );
  }

  return res.status(httpStatus.OK).send(updatedAdditionalService);
});

const deleteAdditionalService = catchAsync(async (req, res) => {
  await additionalServiceService.deleteAdditionalServiceById(req.params.additionalServiceId);
  return res.status(httpStatus.NO_CONTENT).send();
});

const addImageToAdditionalService = catchAsync(async (req, res) => {
  const additionalServiceWithImage = await additionalServiceService.addImageToAdditionalService(
    req.params.additionalServiceId,
    req.body.imageUrl,
    req.body.imageName
  );

  return res.status(httpStatus.CREATED).send(additionalServiceWithImage);
});

const getImagesOfAdditionalService = catchAsync(async (req, res) => {
  const images = await additionalServiceService.getImagesOfAdditionalService(req.params.additionalServiceId);

  return res.status(httpStatus.OK).send(images);
});

const deleteImageFromAdditionalService = catchAsync(async (req, res) => {
  const updatedAdditionalService = await additionalServiceService.deleteImageFromAdditionalService(
    req.params.additionalServiceId,
    req.params.imageId
  );

  return res.status(httpStatus.OK).send(updatedAdditionalService);
});

const bookAdditionalService = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const additionalServiceId = req.params.additionalServiceId; // eslint-disable-line
  const { bookingDate } = req.body;

  const result = await additionalServiceService.bookAdditionalService(additionalServiceId, userId, bookingDate);

  return res.status(httpStatus.OK).send(result);
});

module.exports = {
  createAdditionalService,
  getAdditionalServices,
  getAdditionalService,
  updateAdditionalService,
  deleteAdditionalService,
  getImagesOfAdditionalService,
  bookAdditionalService,
  addImageToAdditionalService,
  deleteImageFromAdditionalService,
};
