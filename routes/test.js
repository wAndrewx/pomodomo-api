const express = require("express");
const router = express.Router();
const { pool } = require("../db/db");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

router.get("/reset", async (req, res, next) => {
  const hashTestPW = await bcrypt.hash("testpassword1!)", 12);
  const hashTestEmail = crypto.randomBytes(16).toString("hex");
  await pool.query(`
  DELETE FROM USERS
    `);

  await pool.query(
    `
    INSERT INTO users (username, email, email_hash, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, email, verified`,
    ["testuser", "test@mail.com", hashTestEmail, hashTestPW]
  );

  await pool.query(
    ` 
  UPDATE USERS
  SET verified = $1
  WHERE username = $2`,
    [true, "testuser"]
  );

  return res.end();
});

module.exports = router;
