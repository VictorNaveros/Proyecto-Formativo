const express = require('express');
const path = require('path');
const cors = require('cors');

// Conexión a la BD (solo con require ya se conecta)
require('./db');

// Rutas de autenticación
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta 'public' (fuera de 'src')
app.use(express.static(path.join(__dirname, '..', 'public')));

// Ruta para la página principal (si quieres que sea el panel público o lo que definas)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'login.html'));
});

// Ruta de estado (la que ya tenías a modo de ejemplo)
app.get('/api/estado', (req, res) => {
  res.json({ estado: 'Robot en línea' });
});

// Rutas de autenticación (registro / login)
app.use('/api/auth', authRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend Robot escuchando en http://localhost:${PORT}`);
});
