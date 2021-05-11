const crypto = require("crypto");
const axios = require("axios");

// Middleware to check if a user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Please log in to access this route." });
};

// Don't allow action if authenticated
const prohibitAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) return next();
  res.status(200).json({ message: "Already authenticated." });
};

//To check a password has at least 8 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character
const passwordRegexCheck = (password) => {
  // https://www.w3resource.com/javascript/form/password-validation.php
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/;

  return regex.test(password);
};

module.exports = {
  ensureAuthenticated,
  prohibitAuthenticated,
  passwordRegexCheck,
};
