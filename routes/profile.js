const express = require("express");
const router = express.Router();
const utils = require("../utils/utils");
const handleProfile = require("../controllers/handleProfile");
const apicache = require("apicache");
let cache = apicache.middleware;

router
  .route("/")
  .get(utils.ensureAuthenticated, cache("1 minutes"), handleProfile.getData)
  .patch(utils.ensureAuthenticated, handleProfile.updatePomodoroData);

router.patch(
  "/days",
  utils.ensureAuthenticated,
  handleProfile.updateDaysLogged
);

module.exports = router;
