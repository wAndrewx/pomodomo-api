const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const utils = require("./utils/utils");

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
