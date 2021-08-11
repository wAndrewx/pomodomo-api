require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const passport = require("passport");
const auth = require("./auth");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const { pool } = require("./db/db");

// Allow app to use passport strategies
auth(passport);

// Enable cors
app.use(cors({ credentials: true, origin: "https://www.pomodomo.ca/" }));

// Use HTTP request logger middleware
app.use(logger("dev"));

// Parses cookies attached to client request object
app.use(cookieParser());

// Deal with incoming data in the body of the request object
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up our express app to use session
app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7, // Cookie expires in 1 week
    },
    key: "express.sid",
  })
);

// Initialize passport and allow persistent login sessions
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", authRoutes);
app.use("/profile", profileRoutes);

if (
  process.env.NODE_ENV.includes("dev") ||
  process.env.NODE_ENV.includes("test")
) {
  const testingRoute = require("./routes/test");
  app.use("/testing", testingRoute);
}

// Handle errors
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  console.log(err);
  res.json({ error: `${err}` });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

module.exports = { app };
