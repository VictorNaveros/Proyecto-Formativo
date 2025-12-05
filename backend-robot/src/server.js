const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Servir archivos estáticos desde la carpeta 'public' (fuera de 'src')
app.use(express.static(path.join(__dirname, '..', 'public')));

// Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'index.html'));
});

// Otras rutas para el backend (por ejemplo, /api)
app.get('/api/estado', (req, res) => {
  res.json({ estado: 'Robot en línea' });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend Robot escuchando en http://localhost:${PORT}`);
});
