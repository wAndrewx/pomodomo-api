const express = require("express");
const router = express.Router();
const utils = require("../utils/utils");
const handleAuth = require("../controllers/handleAuth");

router.get("/", (req, res, next) => {
  res.status(200).json({ message: "Connection successful." });
});

// Register route
router.post("/register", handleAuth.register);

// Verify email route
router.get("/verification/:hash", handleAuth.verifyEmail);

// Login route
router.post("/login", utils.prohibitAuthenticated, handleAuth.login);

// Logout route
router.get("/logout", handleAuth.logout);

// Only allow authenticated users to access protected route
router.get("/home", utils.ensureAuthenticated, handleAuth.sessionExists);

module.exports = router;
