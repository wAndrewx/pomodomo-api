require("dotenv").config();
const express = require("express");
const app = express();
const fs = require("fs");
const http = require("http");
const https = require("https");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const passport = require("passport");
const auth = require("./auth");
const authRoutes = require("./routes/auth");
const { pool } = require("./db/db");

const privateKey = fs.readFileSync(process.env.KEY, "utf8");
const certificate = fs.readFileSync(process.env.CERT, "utf8");
const credentials = { key: privateKey, cert: certificate };

// Allow app to use passport strategies
auth(passport);

// Enable cors
app.use(cors());

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
      secure: true,
      httpOnly: false,
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

// Handle errors
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  console.log(err);
  res.json({ error: `${err}` });
});

const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV === "production") {
  const httpsServer = https.createServer(credentials, app);

  httpsServer.listen(8443);
} else {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

module.exports = { app };
