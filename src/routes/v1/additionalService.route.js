const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const additionalServiceValidation = require('../../validations/additionalService.validation');
const additionalServiceController = require('../../controllers/additionalService.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('manageAdditionalServices'),
    validate(additionalServiceValidation.createAdditionalService),
    additionalServiceController.createAdditionalService
  )
  .get(
    auth('getAdditionalServices'),
    validate(additionalServiceValidation.getAdditionalServices),
    additionalServiceController.getAdditionalServices
  );

router
  .route('/:additionalServiceId')
  .get(
    auth('getAdditionalServices'),
    validate(additionalServiceValidation.getAdditionalService),
    additionalServiceController.getAdditionalService
  )
  .patch(
    auth('manageAdditionalServices'),
    validate(additionalServiceValidation.updateAdditionalService),
    additionalServiceController.updateAdditionalService
  )
  .delete(
    auth('manageAdditionalServices'),
    validate(additionalServiceValidation.deleteAdditionalService),
    additionalServiceController.deleteAdditionalService
  );

router
  .route('/:additionalServiceId/images')
  .post(
    auth('manageAdditionalServices'),
    validate(additionalServiceValidation.addImageToAdditionalService),
    additionalServiceController.addImageToAdditionalService
  )
  .get(
    auth('getAdditionalServices'),
    validate(additionalServiceValidation.getImagesOfAdditionalService),
    additionalServiceController.getImagesOfAdditionalService
  );

router
  .route('/:additionalServiceId/images/:imageId')
  .delete(
    auth('manageAdditionalServices'),
    validate(additionalServiceValidation.deleteImageFromAdditionalService),
    additionalServiceController.deleteImageFromAdditionalService
  );

router
  .route('/:additionalServiceId/book')
  .post(
    auth('bookAdditionalServices'),
    validate(additionalServiceValidation.bookAdditionalService),
    additionalServiceController.bookAdditionalService
  );

module.exports = router;
