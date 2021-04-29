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

// Uses haveibeenpwned API to check if user password has been found in database breaches
// Source: https://github.com/jamiebuilds/havetheybeenpwned
const haveTheyBeenPwned = async (password, callback) => {
  // Create a hashed version of the password in a format that the API expects
  let hashed = crypto
    .createHash("sha1")
    .update(password)
    .digest("hex")
    .toUpperCase();

  // Get range (first 5 characters of hashed password) and suffix (remaining characters after the 5th character)
  let range = hashed.slice(0, 5);
  let suffix = hashed.slice(5);

  try {
    // Fetch the range
    let response = await axios.get(
      `https://api.pwnedpasswords.com/range/${range}`
    );
    let body = await response.data;

    // Check the range for our suffix
    let regex = new RegExp(`^${suffix}:`, "m");
    return regex.test(body);
  } catch (error) {
    console.log(error);
    return done(null, false, {
      httpCode: 500,
      message: "Error while fetching from pwnedpasswords API",
    });
  }
};

module.exports = {
  ensureAuthenticated,
  prohibitAuthenticated,
  haveTheyBeenPwned,
  passwordRegexCheck,
};
