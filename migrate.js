const mysql = require('mysql2/promise');

async function migrate() {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'vedu@#9339', database: 'habittracker' });
  try {
    const [cols] = await pool.query('DESCRIBE performance;');
    const hasLastCheckedIn = cols.some(c => c.Field === 'last_checked_in');
    
    if (!hasLastCheckedIn) {
      await pool.query('ALTER TABLE performance ADD COLUMN last_checked_in DATE;');
      console.log('Added last_checked_in to performance table!');
    } else {
      console.log('last_checked_in already exists.');
    }
    
    const [colsCheckIn] = await pool.query('DESCRIBE check_in;');
    const hasDate = colsCheckIn.some(c => c.Field === 'date');
    if (!hasDate) {
      await pool.query('ALTER TABLE check_in ADD COLUMN date DATE;');
      console.log('Added date to check_in table!');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

migrate();
