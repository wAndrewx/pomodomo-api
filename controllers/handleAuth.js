const passport = require("passport");
const bcrypt = require("bcrypt");
const Filter = require("bad-words");
const filter = new Filter();
const { pool } = require("../db/db");

filter.addWords("badword");

// Utilizes Custom Callback of passport.js to register users
const register = async (req, res, next) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: "All fields must be completed." });
  }

  if (filter.isProfane(username)) {
    return res
      .status(422)
      .json({ message: "Username must not contain profanity." });
  }

  // Hash password before saving it in database
  const hashedPassword = await bcrypt.hash(password, 12);

  // Check database for existing user by email
  pool.query(
    `SELECT * FROM users
    WHERE email = $1`,
    [email],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Unexpected error." });
      }

      console.log(results.rows);

      if (results.rows.length > 0) {
        return res.status(409).json({
          message: `There is already an account with the email: '${email}'`,
        });
      }

      // Insert user into database
      pool.query(
        `INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, password`,
        [username, email, hashedPassword],
        (err, resuts) => {
          if (err) {
            return res.status(500).json({ error: "Unexpected error." });
          }
          console.log(results.rows);
          res
            .status(201)
            .json({ message: `Check for verification email for ${email}` });
        }
      );
    }
  );
};

const login = async (req, res, next) => {
  passport.authenticate("login", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ success: false, message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);

      console.log(`${user} successfully authenticated.`);
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
  console.log(`${req.user.username} successfully unauthenticated.`);
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

module.exports = { register, login, logout, sessionExists };