const express = require("express");
const router = express.Router();
const utils = require("../utils/utils");
const handleProfile = require("../controllers/handleProfile");

router.get("/", utils.ensureAuthenticated, handleProfile.getData);

module.exports = router;
