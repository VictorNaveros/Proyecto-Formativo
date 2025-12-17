const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',          // cámbialo por tu usuario
  password: '1234567', // cámbialo por tu clave
  database: 'prueba'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err);
    return;
  }
  console.log('✅ Conectado a MySQL correctamente');
});

module.exports = db;
