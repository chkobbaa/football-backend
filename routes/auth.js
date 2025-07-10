const express = require("express");
const router = express.Router();
const pool = require("../db/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/signup", async (req, res) => {
  try {
    const { name, number, password } = req.body;
    if (!name || !number || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    await pool.query(
      "INSERT INTO users (name, number, password_hash) VALUES ($1, $2, $3)",
      [name, number, hashedPassword]
    );

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.code === "23505") {
      // Unique violation (duplicate number)
      res.status(400).json({ error: "Number already in use" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

router.post("/login", async (req, res) => {
  try {
    const { number, password } = req.body;
    if (!number || !password) {
      return res.status(400).json({ error: "Missing number or password" });
    }

    const result = await pool.query("SELECT * FROM users WHERE number = $1", [number]);
    const user = result.rows[0];

    if (!user) {
      return res.status(403).json({ error: "Invalid number or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(403).json({ error: "Invalid number or password" });
    }

    const token = jwt.sign({ id: user.id, number: user.number }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
