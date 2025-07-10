const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.connect()
  .then(client => {
    console.log("✅ Successfully connected to the database");
    client.release();
  })
  .catch(err => {
    console.error("❌ Database connection error:", err.stack);
  });

module.exports = pool;
