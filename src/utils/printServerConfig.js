const mongoose = require('mongoose');
const logger = require('../config/logger');

const printServerConfig = async () => {
  const admin = new mongoose.mongo.Admin(mongoose.connection.db);
  admin.buildInfo(function (err, info) {
    logger.info(`MongoDB Version: ${info.version}`);
    logger.info(`Mongoose Version: ${mongoose.version}`);
    logger.info(`Node.js Version: ${process.version}`);
    logger.info(`Running on: ${process.platform}`);
    logger.info(`Server Time: ${new Date()}`);
    logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
  });
};

module.exports = printServerConfig;
