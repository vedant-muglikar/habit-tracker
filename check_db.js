const mysql = require('mysql2/promise');

async function check() {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'vedu@#9339', database: 'habittracker' });
  try {
    const [tables] = await pool.query('SHOW TABLES;');
    console.log("Tables: ", JSON.stringify(tables, null, 2));
    
    // Also describe check_in to see if it has more columns, maybe 'date' is needed
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

check();
