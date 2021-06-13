const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const { pool } = require("./db/db");

module.exports = (passport) => {
  // Convert object contents into a key
  passport.serializeUser((user, done) => done(null, user.id));

  // Convert key into original object and retrieve object contents
  passport.deserializeUser((id, done) => {
    pool.query(`SELECT * FROM users WHERE id = $1`, [id], (err, results) => {
      if (err) return done(err);
      if (!results.rows[0]) return done(null, false);
      return done(null, results.rows[0]);
    });
  });

  // Define process to use when we try to authenticate someone locally
  passport.use(
    "login",
    new LocalStrategy(async (username, password, done) => {
      try {
        // Query for user by username in database
        const queryUsername = await pool.query(
          `SELECT * FROM users WHERE username = $1`,
          [username]
        );

        // User doesn't exist if no user was found
        if (queryUsername.rowCount === 0) {
          return done(null, false, {
            message: "Invalid credentials.",
          });
        } else if (!queryUsername.rows[0].verified) {
          return done(null, false, {
            message: "Please verify your account to login.",
          });
        }

        const user = queryUsername.rows[0];

        // Compare password entered and password in database
        const validated = await bcrypt.compare(password, user.password);

        if (!validated) {
          return done(null, false, {
            message: "Invalid credentials.",
          });
        }

        return done(null, user, {
          message: `${username} logged in successfully.`,
        });
      } catch (error) {
        console.log("passport login error:", error);
        return done(error);
      }
    })
  );
};
