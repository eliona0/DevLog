
const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'root',
  password: '',   
  database: 'devlog' 
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
