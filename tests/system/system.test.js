const httpStatus = require('http-status');
const request = require('supertest');

const app = require('../../src/app');
const config = require('../../src/config/config');
const setupTestDB = require('../utils/setupTestDB');
const createDefaultAdmin = require('../../src/utils/createDefaultAdmin');

(async () => {
  await setupTestDB();
})();

const testSuiteState = {
  adminToken: null,
  admin: null,

  additionalService: null,

  customer1: null,
  customer1Token: null,
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
        name: 'test service',
        price: '100.00',
      });

    expect(response.status).toBe(httpStatus.CREATED);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('price');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('images');

    expect(response.body.name).toBe('test service');
    expect(response.body.price).toBe('100.00');
    expect(response.body.description).toBe('');
    expect(response.body.images).toEqual([]);

    testSuiteState.additionalService = response.body;
  });

  test('ADMIN: should get additional services', async () => {
    const response = await request(app)
      .get(`/v1/additional-services/${testSuiteState.additionalService.id}`)
      .set('Cookie', [`access_token=${testSuiteState.adminToken}`]);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('price');
    expect(response.body).toHaveProperty('isAvailable');

    expect(response.body.name).toBe(testSuiteState.additionalService.name);
    expect(response.body.price).toBe(testSuiteState.additionalService.price);
    expect(response.body.description).toBe(testSuiteState.additionalService.description);
    expect(response.body.images).toEqual(testSuiteState.additionalService.images);
    expect(response.body.isAvailable).toBe(testSuiteState.additionalService.isAvailable);

    expect(response.body.id).toBe(testSuiteState.additionalService.id);
  });

  test('ADMIN: should get additional services list', async () => {
    const response = await request(app)
      .get('/v1/additional-services')
      .set('Cookie', [`access_token=${testSuiteState.adminToken}`]);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toHaveProperty('totalResults');
    expect(response.body).toHaveProperty('results');

    expect(response.body.totalResults).toBe(1);
    expect(response.body.results).toHaveLength(1);

    expect(response.body.results[0]).toHaveProperty('id');
    expect(response.body.results[0]).toHaveProperty('name');
    expect(response.body.results[0]).toHaveProperty('price');
    expect(response.body.results[0]).toHaveProperty('description');

    expect(response.body.results[0].name).toBe(testSuiteState.additionalService.name);
    expect(response.body.results[0].price).toBe(testSuiteState.additionalService.price);
    expect(response.body.results[0].description).toBe(testSuiteState.additionalService.description);
    expect(response.body.results[0].images).toEqual(testSuiteState.additionalService.images);
    expect(response.body.results[0].id).toBe(testSuiteState.additionalService.id);
  });

  test('ADMIN: should update additional service', async () => {
    const response = await request(app)
      .patch(`/v1/additional-services/${testSuiteState.additionalService.id}`)
      .set('Cookie', [`access_token=${testSuiteState.adminToken}`])
      .send({
        name: 'test service updated',
      });

    expect(response.status).toBe(httpStatus.OK);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('price');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('images');

    expect(response.body.name).toBe('test service updated');
    expect(response.body.price).toEqual('100.00');
    expect(response.body.description).toBe('');
    expect(response.body.images).toEqual([]);

    expect(response.body.id).toBe(testSuiteState.additionalService.id);
    expect(response.body.name).not.toBe(testSuiteState.additionalService.name);

    testSuiteState.additionalService = response.body;
  });

  test('ADMIN: should create a new service and then delete that service', async () => {
    const response = await request(app)
      .post('/v1/additional-services')
      .set('Cookie', [`access_token=${testSuiteState.adminToken}`])
      .send({
        name: 'test service 2',
        price: '300.00',
      });

    expect(response.status).toBe(httpStatus.CREATED);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('test service 2');
    expect(response.body.price).toBe('300.00');

    const deleteResponse = await request(app)
      .delete(`/v1/additional-services/${response.body.id}`)
      .set('Cookie', [`access_token=${testSuiteState.adminToken}`]);

    expect(deleteResponse.status).toBe(httpStatus.NO_CONTENT);
    expect(deleteResponse.body).toEqual({});
  });

  test('ADMIN: should add image to additional service', async () => {
    const response = await request(app)
      .post(`/v1/additional-services/${testSuiteState.additionalService.id}/images`)
      .send({
        imageUrl: 'https://source.unsplash.com/random/800x450/?sport',
        imageName: 'test image',
      })
      .set('Cookie', [`access_token=${testSuiteState.adminToken}`]);

    expect(response.status).toBe(httpStatus.CREATED);
    expect(response.body).toHaveProperty('id');
    expect(response.body.images[0]).toHaveProperty('id');
    expect(response.body.images[0].imageUrl).toBe('https://source.unsplash.com/random/800x450/?sport');
    expect(response.body.images[0].imageName).toBe('test image');

    testSuiteState.additionalService = response.body;
  });

  test('ADMIN: should remove image from a temporary additional service', async () => {
    const response = await request(app)
      .post('/v1/additional-services')
      .set('Cookie', [`access_token=${testSuiteState.adminToken}`])
      .send({
        name: 'test service 2',
        price: '300.00',
      });

    expect(response.status).toBe(httpStatus.CREATED);
    expect(response.body).toHaveProperty('id');

    const addImageResponse = await request(app)
      .post(`/v1/additional-services/${response.body.id}/images`)
      .send({
        imageUrl: 'https://source.unsplash.com/random/800x450/?sport',
        imageName: 'test image',
      })
      .set('Cookie', [`access_token=${testSuiteState.adminToken}`]);

    expect(addImageResponse.status).toBe(httpStatus.CREATED);
    expect(addImageResponse.body).toHaveProperty('id');
    expect(addImageResponse.body.images[0]).toHaveProperty('id');

    const removeImageResponse = await request(app)
      .delete(`/v1/additional-services/${response.body.id}/images/${addImageResponse.body.images[0].id}`)
      .set('Cookie', [`access_token=${testSuiteState.adminToken}`]);

    expect(removeImageResponse.status).toBe(httpStatus.OK);
    expect(removeImageResponse.body).toHaveProperty('id');
    expect(removeImageResponse.body.images).toHaveLength(0);
    expect(removeImageResponse.body.id).toBe(response.body.id);

    const deleteResponse = await request(app)
      .delete(`/v1/additional-services/${response.body.id}`)
      .set('Cookie', [`access_token=${testSuiteState.adminToken}`]);

    expect(deleteResponse.status).toBe(httpStatus.NO_CONTENT);
    expect(deleteResponse.body).toEqual({});
  });

  test('ADMIN: should get all images of additional service', async () => {
    const response = await request(app)
      .get(`/v1/additional-services/${testSuiteState.additionalService.id}/images`)
      .set('Cookie', [`access_token=${testSuiteState.adminToken}`]);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0].imageUrl).toBe('https://source.unsplash.com/random/800x450/?sport');
    expect(response.body[0].imageName).toBe('test image');
  });

  test('CUSTOMER: should register', async () => {
    const response = await request(app).post('/v1/auth/register').send({
      email: 'test.customer1@example.com',
      password: 'Test123!',
      name: 'Test Customer 1',
    });

    expect(response.status).toBe(httpStatus.CREATED);

    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe('test.customer1@example.com');
    expect(response.body.user.name).toBe('Test Customer 1');
    expect(response.body.user.role).toBe('user');
    expect(response.body.user.balance).toBe('0.00');
    expect(response.body.user.bookedAdditionalServices).toHaveLength(0);
    expect(response.body.user.isEmailVerified).toBe(false);

    expect(response.body.tokens.access.token).toBeDefined();
    expect(response.body.tokens.access.expires).toBeDefined();

    testSuiteState.customer1 = response.body.user;
  });

  test('CUSTOMER: should login', async () => {
    const response = await request(app).post('/v1/auth/login').send({
      email: 'test.customer1@example.com',
      password: 'Test123!',
    });

    // NOTE: isEmailVerified check is deactivated for now
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.id).toBe(testSuiteState.customer1.id);
    expect(response.body.user.email).toBe(testSuiteState.customer1.email);
    expect(response.body.user.name).toBe(testSuiteState.customer1.name);
    expect(response.body.user.role).toBe(testSuiteState.customer1.role);
    expect(response.body.user.balance).toBe(testSuiteState.customer1.balance);
    expect(response.body.user.bookedAdditionalServices).toHaveLength(0);
    expect(response.body.user.isEmailVerified).toBe(testSuiteState.customer1.isEmailVerified);

    expect(response.body.tokens.access.token).toBeDefined();
    expect(response.body.tokens.access.expires).toBeDefined();

    testSuiteState.customer1Token = response.body.tokens.access.token;
    testSuiteState.customer1 = response.body.user;
  });

  test('ADMIN: should delete a registered user', async () => {
    const response = await request(app).post('/v1/auth/register').send({
      email: 'test.customer2@example.com',
      password: 'Test123!',
      name: 'Test Customer 2',
    });

    expect(response.status).toBe(httpStatus.CREATED);

    const tempCustomer = response.body.user;

    const deleteResponse = await request(app)
      .delete(`/v1/users/${tempCustomer.id}`)
      .set('Cookie', [`access_token=${testSuiteState.adminToken}`]);

    expect(deleteResponse.status).toBe(httpStatus.NO_CONTENT);
    expect(deleteResponse.body).toEqual({});
  });

  test('ADMIN: should update a registered user', async () => {
    const response = await request(app)
      .patch(`/v1/users/${testSuiteState.customer1.id}`)
      .send({ name: 'Test Customer 1 Updated' })
      .set('Cookie', [`access_token=${testSuiteState.adminToken}`]);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBe(testSuiteState.customer1.id);
    expect(response.body.email).toBe(testSuiteState.customer1.email);
    expect(response.body.name).toBe('Test Customer 1 Updated');
    expect(response.body.role).toBe(testSuiteState.customer1.role);
    expect(response.body.balance).toBe(testSuiteState.customer1.balance);
    expect(response.body.bookedAdditionalServices).toHaveLength(0);
    expect(response.body.isEmailVerified).toBe(testSuiteState.customer1.isEmailVerified);

    testSuiteState.customer1 = response.body;
  });

  test('ADMIN: should get a registered user', async () => {
    const response = await request(app)
      .get(`/v1/users/${testSuiteState.customer1.id}`)
      .set('Cookie', [`access_token=${testSuiteState.adminToken}`]);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBe(testSuiteState.customer1.id);
    expect(response.body.email).toBe(testSuiteState.customer1.email);
    expect(response.body.name).toBe('Test Customer 1 Updated');
    expect(response.body.role).toBe(testSuiteState.customer1.role);
    expect(response.body.balance).toBe(testSuiteState.customer1.balance);
    expect(response.body.bookedAdditionalServices).toHaveLength(0);
    expect(response.body.isEmailVerified).toBe(testSuiteState.customer1.isEmailVerified);
  });

  test('ADMIN: should get all registered users', async () => {
    const response = await request(app)
      .get('/v1/users')
      .set('Cookie', [`access_token=${testSuiteState.adminToken}`]);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body.results).toHaveLength(2);
    expect(response.body.results[1].id).toBe(testSuiteState.customer1.id);
    expect(response.body.results[1].email).toBe(testSuiteState.customer1.email);
    expect(response.body.results[1].name).toBe('Test Customer 1 Updated');
    expect(response.body.results[1].role).toBe(testSuiteState.customer1.role);
    expect(response.body.results[1].balance).toBe(testSuiteState.customer1.balance);
    expect(response.body.results[1].bookedAdditionalServices).toHaveLength(0);
    expect(response.body.results[1].isEmailVerified).toBe(testSuiteState.customer1.isEmailVerified);
  });

  test('CUSTOMER: should update his account details', async () => {
    const response = await request(app)
      .patch(`/v1/users/${testSuiteState.customer1.id}`)
      .send({ name: 'Test Customer 1 Updated Himself' })
      .set('Cookie', [`access_token=${testSuiteState.customer1Token}`]);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBe(testSuiteState.customer1.id);
    expect(response.body.email).toBe(testSuiteState.customer1.email);
    expect(response.body.name).toBe('Test Customer 1 Updated Himself');
    expect(response.body.role).toBe(testSuiteState.customer1.role);
    expect(response.body.balance).toBe(testSuiteState.customer1.balance);
    expect(response.body.bookedAdditionalServices).toHaveLength(0);
    expect(response.body.isEmailVerified).toBe(testSuiteState.customer1.isEmailVerified);

    testSuiteState.customer1 = response.body;
  });

  test('CUSTOMER: should get his account details', async () => {
    const response = await request(app)
      .get(`/v1/users/${testSuiteState.customer1.id}`)
      .set('Cookie', [`access_token=${testSuiteState.customer1Token}`]);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBe(testSuiteState.customer1.id);
    expect(response.body.email).toBe(testSuiteState.customer1.email);
    expect(response.body.name).toBe('Test Customer 1 Updated Himself');
    expect(response.body.role).toBe(testSuiteState.customer1.role);
    expect(response.body.balance).toBe(testSuiteState.customer1.balance);
    expect(response.body.bookedAdditionalServices).toHaveLength(0);
    expect(response.body.isEmailVerified).toBe(testSuiteState.customer1.isEmailVerified);
  });

  test('CUSTOMER: should not get all registered users', async () => {
    const response = await request(app)
      .get('/v1/users')
      .set('Cookie', [`access_token=${testSuiteState.customer1Token}`]);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  test('CUSTOMER: should delete his account', async () => {
    // create a temp user
    const tempUserRegisterResponse = await request(app).post('/v1/auth/register').send({
      email: 'test.customer3@example.com',
      password: 'Test123!',
      name: 'Test Customer 3',
    });

    expect(tempUserRegisterResponse.status).toBe(httpStatus.CREATED);

    const tempCustomer = tempUserRegisterResponse.body.user;
    const tempCustomerAccessToken = tempUserRegisterResponse.body.tokens.access.token;

    const response = await request(app)
      .delete(`/v1/users/${tempCustomer.id}`)
      .set('Cookie', [`access_token=${tempCustomerAccessToken}`]);

    expect(response.status).toBe(httpStatus.NO_CONTENT);
    expect(response.body).toEqual({});
  });

  test('CUSTOMER: should book an additional service', async () => {
    const response = await request(app)
      .post(`/v1/additional-services/${testSuiteState.additionalService.id}/book`)
      .set('Cookie', [`access_token=${testSuiteState.customer1Token}`])
      .send({
        bookingDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
      });

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('additionalService');

    expect(response.body.user.id).toBe(testSuiteState.customer1.id);
    expect(response.body.user.balance).toBe(
      (testSuiteState.customer1.balance - testSuiteState.additionalService.price).toFixed(2)
    );
    expect(response.body.user.bookedAdditionalServices).toHaveLength(1);
    expect(response.body.user.bookedAdditionalServices[0].bookedAdditionalService).toBe(testSuiteState.additionalService.id);
    expect(response.body.additionalService.id).toBe(testSuiteState.additionalService.id);
  });
});
