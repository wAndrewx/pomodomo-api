const { pool } = require("../db/db");

const getData = async (req, res, next) => {
  try {
    const checkResults = await pool.query(
      `
    SELECT * FROM users
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
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const updatePomodoroData = async (req, res, next) => {
  try {
    const { hours_focused, pomodoros_completed } = req.body;

    const checkHoursAndPomodorosResults = await pool.query(
      `
    UPDATE users
    SET hours_focused = hours_focused + $1,
        pomodoros_completed = pomodoros_completed + $2
    WHERE username = $3`,
      [hours_focused, pomodoros_completed, req.user.username]
    );

    if (checkHoursAndPomodorosResults.rowCount === 0) {
      return res
        .status(404)
        .json("Did not update user data. No information found for this user.");
    }

    res.status(204).json();
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const updateDaysLogged = async (req, res, next) => {
  try {
    const checkLastDayLogged = await pool.query(
      `
      SELECT *
      FROM users
      WHERE last_day_logged >= now()::date AND last_day_logged < now()::date + interval '1 day'
      AND username = $1`,
      [req.user.username]
    );

    if (checkLastDayLogged.rowCount === 0) {
      const checkDaysLoggedResults = await pool.query(
        `
      UPDATE users
      SET days_logged = days_logged + 1,
        last_day_logged = NOW()
      WHERE username = $1`,
        [req.user.username]
      );

      if (checkDaysLoggedResults.rowCount === 0) {
        return res
          .status(404)
          .json(
            "Did not update days logged for the user. No information found for the user."
          );
      }
    }

    res.status(204).json();
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

module.exports = { getData, updatePomodoroData, updateDaysLogged };
