const express = require('express');
const cors = require('cors'); // ✅ Importar cors
const { Pool } = require('pg');
const app = express();

app.use(cors()); // ✅ Permitir CORS
app.use(express.json());

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: { rejectUnauthorized: false }
});

// Rutas
app.get('/contactos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contactos ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener contactos' });
  }
});

app.post('/contactos', async (req, res) => {
  const { nombre, telefono } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO contactos (nombre, telefono) VALUES ($1, $2) RETURNING *',
      [nombre, telefono]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar contacto' });
  }
});

app.delete('/contactos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM contactos WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar contacto' });
  }
});

app.get('/', (req, res) => {
  res.send('🚀 API de Contactos funcionando en Render');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});