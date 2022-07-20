const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');

const additionalServiceSchemaOptions = {
  collection: 'additionalServices',
  timestamps: true,
};

const imageSchema = mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isURL(value)) {
        throw new Error(`Invalid URL: ${value}`);
      }
    },
  },
  imageName: { type: String, required: true },
});

imageSchema.plugin(toJSON);

const additionalServiceSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (
          !validator.isCurrency(value, {
            allow_negatives: false,
            require_symbol: false,
            allow_decimal: true,
            require_decimal: true,
            digits_after_decimal: [2],
            thousands_separator: ',',
            decimal_separator: '.',
          })
        ) {
          throw new Error(`Invalid price: ${value}`);
        }
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    images: {
      type: [imageSchema],
      default: [],
    },
  },
  additionalServiceSchemaOptions
);

// add plugin that converts mongoose to json
additionalServiceSchema.plugin(toJSON);
additionalServiceSchema.plugin(paginate);

additionalServiceSchema.statics.isAdditionalServiceNameTaken = async function (name, excludeUserId) {
  const additionalService = await this.findOne({ name, _id: { $ne: excludeUserId } });
  return !!additionalService;
};

/**
 * @typedef AdditionalService
 */
const AdditionalService = mongoose.model('AdditionalService', additionalServiceSchema);

module.exports = AdditionalService;
