/* eslint-disable no-restricted-syntax */
const mongoose = require('mongoose');
const config = require('../../src/config/config');
const logger = require('../../src/config/logger');

async function dropAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for await (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    try {
      await collection.drop();
    } catch (error) {
      // This error happens when you try to drop a collection that's already dropped. Happens infrequently.
      // Safe to ignore.
      if (error.message === 'ns not found') return;

      // This error happens when you use it.todo.
      // Safe to ignore.
      if (error.message.includes('a background operation is currently running')) return;

      logger.error(error.message);
    }
  }
}

const setupTestDBforSystemTest = async () => {
  beforeAll(async () => {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await dropAllCollections();
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  afterAll(async () => {
    await Promise.all(Object.values(mongoose.connection.collections).map(async (collection) => collection.deleteMany()));
    await dropAllCollections();

    await new Promise((resolve) => setTimeout(resolve, 500));
    await dropAllCollections();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await mongoose.connection.dropDatabase().then(async () => {
      try {
        mongoose.connection.close();
      } catch (err) {
        logger.error(err);
      }
    });
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
};

module.exports = setupTestDBforSystemTest;
