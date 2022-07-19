const httpStatus = require('http-status');
const request = require('supertest');

const app = require('../../src/app');
const config = require('../../src/config/config');
const setupTestDB = require('../utils/setupTestDB');
const createDefaultAdmin = require('../../src/utils/createDefaultAdmin');

const { User, AdditionalService } = require('../../src/models');

(async () => {
  await setupTestDB();
})();

const testSuiteState = {
  adminToken: null,
  admin: null,

  userToken: null,
  user: null,
};

describe('System test', function () {
  test('ADMIN: should login', async () => {
    await createDefaultAdmin();

    const response = await request(app).post('/v1/auth/login').send({
      email: config.deployment.defaultAdminEmail,
      password: config.deployment.defaultAdminPassword,
    });

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body.tokens.access).toHaveProperty('token');
    testSuiteState.adminToken = response.body.tokens.access.token;
    testSuiteState.admin = response.body.user;
  });

  test('ADMIN: should create an additional service', async () => {
    const response = await request(app)
      .post('/v1/additional-services')
      .set('Cookie', [`access_token=${testSuiteState.adminToken}`])
      .send({
        name: 'Test service',
        price: 100,
      });

    expect(response.status).toBe(httpStatus.CREATED);
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('price');
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('updatedAt');
    testSuiteState.admin = response.body;
  });

  test('ADMIN: should get additional services', async () => {
    const response = await request(app)
      .get('/v1/additional-services')
      .set('Cookie', [`access_token=${testSuiteState.adminToken}`]);

    // console.log(testSuiteState.adminToken);
    // console.log(await User.findOne({ email: config.deployment.defaultAdminEmail }));

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveLength(0);
  });
});
