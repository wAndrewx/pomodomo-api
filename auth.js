const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const Filter = require("bad-words");
const filter = new Filter();
const User = require("./models/user");
const utils = require("./utils/utils");

filter.addWords("badword");

module.exports = (passport) => {
  // Convert object contents into a key
  passport.serializeUser((user, done) => done(null, user._id));

  // Convert key into original object and retrieve object contents
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      if (err) return done(err);
      done(null, user);
    });
  });

  // Define process to use when a user registers
  passport.use(
    "register",
    new LocalStrategy(async (username, password, done) => {
      try {
        // Remove whitespaces in username
        let trimUsername = username.trim();

        if (filter.isProfane(username)) {
          return done(null, false, {
            httpCode: 422,
            message: "Username must not contain profanity.",
          });
        } else if (trimUsername.length >= 50) {
          return done(null, false, {
            httpCode: 422,
            message: "Username cannot be 50 characters or longer.",
          });
        }

        let user = await User.findOne({ username: trimUsername });
        const pwned = await utils.haveTheyBeenPwned(password, done);

        // If a user document exists then the username is taken
        if (user) {
          return done(null, false, {
            message: `Username '${trimUsername}' is taken.`,
          });
          // Next two elseifs are password validation checks
        } else if (!utils.passwordRegexCheck(password)) {
          return done(null, false, {
            httpCode: 422,
            message:
              "Password must contain at least 8 characters and must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.",
          });
        } else if (pwned) {
          return done(null, false, {
            httpCode: 422,
            message: "Password has been found in database breach.",
          });
        }

        // Hash password before saving it in database
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert user into the database
        user = await User.create({
          username: trimUsername,
          password: hashedPassword,
        });

        return done(null, user, {
          message: `User ${trimUsername} successfully registered!`,
        });
      } catch (error) {
        console.log("passport register error:", error);
        done(error);
      }
    })
  );

  // Define process to use when we try to authenticate someone locally
  passport.use(
    "login",
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username: username });
        console.log(`User ${username} attempted to log in`);

        if (!user) {
          console.log(`User ${username} doesn't exist.`);
          return done(null, false, {
            message: "Invalid username or password.",
          });
        }

        const validated = await bcrypt.compare(password, user.password);

        if (!validated) {
          console.log("Invalid password");
          return done(null, false, {
            message: "Invalid username or password.",
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
