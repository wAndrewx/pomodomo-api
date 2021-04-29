require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const sessionStore = MongoStore.create({ mongoUrl: process.env.MONGO_URI });
const auth = require("./auth");
const connectDB = require("./db/db");
const authRoutes = require("./routes/auth");

// Connect to MongoDB
connectDB();

// Allow app to use passport strategies
auth(passport);

/**** START OF MIDDLEWARE ****/

// Enable cors
app.use(cors());

// Implement a Root-Level Request Logger Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Parses cookies attached tto client request object
app.use(cookieParser());

// Deal with incoming data in the body off the request object
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up our express app to use session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7, // Cookie expires in 1 week
    },
    key: "express.sid",
    store: sessionStore,
  })
);

// Initialize passport and allow persistent login sessions
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", authRoutes);

// Handle errors
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  console.log(err);
  res.json({ error: `${err}` });
});

/**** END OF MIDDLEWARE ****/

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

module.exports = { app };
