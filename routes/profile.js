const express = require("express");
const router = express.Router();
const utils = require("../utils/utils");
const handleProfile = require("../controllers/handleProfile");

router
  .route("/")
  .get(utils.ensureAuthenticated, handleProfile.getData)
  .patch(utils.ensureAuthenticated, handleProfile.updatePomodoroData);

router.patch(
  "/days",
  utils.ensureAuthenticated,
  handleProfile.updateDaysLogged
);

module.exports = router;
