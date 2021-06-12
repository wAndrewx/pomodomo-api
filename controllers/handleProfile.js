const { pool } = require("../db/db");

const getData = async (req, res, next) => {
  const checkResults = await pool.query(
    `SELECT * FROM users
    WHERE username = $1`,
    [req.user.username]
  );

  if (checkResults.rowCount === 0) {
    return res.status(404).json("No data found for this user.");
  }

  const {
    hours_focused,
    pomodoros_completed,
    days_logged,
  } = checkResults.rows[0];

  const profileData = {
    hours_focused,
    pomodoros_completed,
    days_logged,
  };

  res.status(200).json(profileData);
};

module.exports = { getData };
