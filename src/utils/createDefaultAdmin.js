const config = require('../config/config');
const logger = require('../config/logger');
const { userService } = require('../services');

const createDefaultAdmin = async () => {
  if (!(await userService.getUserByEmail(config.deployment.defaultAdminEmail))) {
    const admin = {
      name: 'DEFAULT ADMIN',
      email: config.deployment.defaultAdminEmail,
      password: config.deployment.defaultAdminPassword,
      role: 'admin',
      isEmailVerified: true,
    };

    await userService.createUser(admin);
    logger.info('Default admin created, please change your password later!');
  }
};

module.exports = createDefaultAdmin;
