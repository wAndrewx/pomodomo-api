const crypto = require("crypto");
const passport = require("passport");
const bcrypt = require("bcrypt");
const Filter = require("bad-words");
const filter = new Filter();
const { pool } = require("../db/db");
const utils = require("../utils/utils");

filter.addWords("badword");

// Utilizes Custom Callback of passport.js to register users
const register = async (req, res, next) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: "All fields must be completed." });
  } else if (filter.isProfane(username)) {
    return res
      .status(422)
      .json({ message: "Username must not contain profanity." });
  } else if (!utils.passwordRegexCheck(password)) {
    return res
      .status(422)
      .json({ message: "Password must meet all requirements." });
  }

  try {
    // Check database for existing user by email
    const checkResults = await pool.query(
      `SELECT * FROM users
    WHERE email = $1`,
      [email]
    );

    if (!checkResults) {
      return res.status(500).json({ message: "Unexpected error." });
    }

    if (checkResults.rows.length > 0) {
      return res.status(409).json({
        message: `There is already an account with the email: '${email}'`,
      });
    }

    // Create hash for password and email
    const hashedPassword = await bcrypt.hash(password, 12);
    const emailHash = crypto.randomBytes(16).toString("hex");

    utils.sendEmail(email, emailHash, username);

    // Insert user into database
    const insertResults = await pool.query(
      `INSERT INTO users (username, email, email_hash, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, email, verified`,
      [username, email, emailHash, hashedPassword]
    );

    if (!insertResults) {
      return res.status(500).json({ message: "Unexpected error." });
    }

    console.log("insertResultsRows:", insertResults.rows);

    res
      .status(201)
      .json({ message: `Check for verification email for ${email}` });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  const { hash } = req.params;
  try {
    // Find user by email hash and update their verified state
    const updateAccount = await pool.query(
      `UPDATE users 
    SET verified = TRUE
    WHERE email_hash = $1
    RETURNING verified
      `,
      [hash]
    );

    if (
      !updateAccount ||
      updateAccount.rows.length === 0 ||
      !updateAccount.rows[0].verified
    ) {
      return res.status(409).json({ message: "Unable to activate account." });
    }

    res.status(204).send();
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const login = (req, res, next) => {
  passport.authenticate("login", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ success: false, message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);

      return res.status(200).json({
        success: true,
        message: info.message,
        userId: user._id,
      });
    });
  })(req, res, next);
};

// Differentiate on outcome of logout handler by response body instead of http status code
const logout = (req, res) => {
  if (!req.user) {
    // Could return a status code of 404 but depends what the client prefers
    return res
      .status(200)
      .json({ message: "No user session to unauthenticate." });
  }
  req.logout();
  res.status(200).json({ message: "Unauthenticated." });
};

// Respond with code 200 and specific response body if user session exists
const sessionExists = (req, res) => {
  res.status(200).json({
    message: "Authenticated!",
    sessionPassportId: req.session.passport.user,
    username: req.user.username,
  });
};

module.exports = { register, verifyEmail, login, logout, sessionExists };
