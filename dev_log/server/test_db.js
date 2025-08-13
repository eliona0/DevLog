// test_db.js
const mysql = require('mysql2/promise');

// Krijo konfigurimin e lidhjes me DB - ndrysho sipas teje
const config = {
  host: 'localhost',
  user: 'root',
  password: '',    // password-in tënd
  database: 'devlog'  // emri i databazës që ke krijuar në phpMyAdmin
};

async function testConnection() {
  try {
    const connection = await mysql.createConnection(config);
    console.log('MySQL database connected successfully!');
    await connection.end();
  } catch (error) {
    console.error('MySQL connection failed:', error);
  }
}

testConnection();
