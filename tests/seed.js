require("dotenv").config();
const faker = require("faker");

// This password meets our regex checks and hasn't been found in a database breach
const validatedPassword = process.env.VALIDATED_PW;

// Generate a random username and password to user for test cases
const newUser = {
  email: faker.internet.email(),
  username: faker.internet.userName(),
  password: validatedPassword,
};
// This user will never exist in the database
const doesNotExistUser = {
  email: faker.internet.email(),
  username: faker.internet.userName(),
  password: validatedPassword,
};
// Use existing account credentials for test cases
const existingUser = {
  email: faker.internet.email(),
  username: faker.internet.userName(),
  password: validatedPassword,
};

module.exports = {
  validatedPassword,
  newUser,
  doesNotExistUser,
  existingUser,
};
