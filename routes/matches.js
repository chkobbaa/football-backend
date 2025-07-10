const express = require("express");
const router = express.Router();
const pool = require("../db/connection");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, async (req, res) => {
  const result = await pool.query("SELECT * FROM matches");
  res.json(result.rows);
});

router.post("/", authenticateToken, async (req, res) => {
  const { location, date, price_pp } = req.body;
  await pool.query(
    "INSERT INTO matches (location, date, price_pp, created_by) VALUES ($1, $2, $3, $4)",
    [location, date, price_pp, req.user.id]
  );
  res.sendStatus(201);
});

router.post("/:id/join", authenticateToken, async (req, res) => {
  const matchId = req.params.id;
  await pool.query(
    "INSERT INTO participants (match_id, user_id, has_paid) VALUES ($1, $2, false)",
    [matchId, req.user.id]
  );
  res.sendStatus(200);
});

router.post("/:id/pay", authenticateToken, async (req, res) => {
  const matchId = req.params.id;
  await pool.query(
    "UPDATE participants SET has_paid = true WHERE match_id = $1 AND user_id = $2",
    [matchId, req.user.id]
  );
  res.sendStatus(200);
});

module.exports = router;
