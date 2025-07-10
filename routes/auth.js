const express = require("express");
const router = express.Router();
const pool = require("../db/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/signup", async (req, res) => {
  const { name, number, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO users (name, number, password_hash) VALUES ($1, $2, $3)",
    [name, number, hashedPassword]
  );
  res.sendStatus(201);
});

router.post("/login", async (req, res) => {
  const { number, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE number = $1", [
    number,
  ]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.sendStatus(403);

  const token = jwt.sign({ id: user.id, number: user.number }, process.env.JWT_SECRET);
  res.json({ token });
});

module.exports = router;
