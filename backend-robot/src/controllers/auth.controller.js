const bcrypt = require('bcryptjs');
const db = require('../db');

// POST /api/auth/registro
const registrarUsuario = async (req, res) => {
  const { username, password, email, role } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO usuarios (username, password, email, role) VALUES (?, ?, ?, ?)';
    const values = [username, hashed, email, role || 'admin'];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error registrando usuario:', err);
        return res.status(500).json({ message: 'Error al registrar usuario' });
      }
      res.status(201).json({ message: 'Usuario registrado', id: result.insertId });
    });
  } catch (err) {
    console.error('Error cifrando contraseña:', err);
    res.status(500).json({ message: 'Error interno' });
  }
};

// POST /api/auth/login
const loginUsuario = async (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE username = ?';

  db.query(sql, [username], async (err, rows) => {
    if (err) {
      console.error('Error consultando usuario:', err);
      return res.status(500).json({ message: 'Error en base de datos' });
    }

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Más adelante aquí metemos JWT; por ahora devolvemos datos básicos
    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  });
};

module.exports = {
  registrarUsuario,
  loginUsuario,
};
