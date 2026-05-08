// db.js
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const promisePool = pool.promise();

// ✅ TEST CONNECTION
(async () => {
  try {
    const [rows] = await promisePool.query('SELECT 1');
    console.log('✅ MySQL Connected Successfully');
  } catch (err) {
    console.error('❌ MySQL Connection Failed:', err.message);
  }
})();

module.exports = promisePool;
