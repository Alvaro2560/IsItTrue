const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080; // O el puerto que quieras usar

// Sirve los archivos estáticos de la carpeta de compilación
app.use(express.static(path.join(__dirname, 'dist')));

// Resuelve cualquier ruta al archivo `index.html`
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

// Inicia el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});