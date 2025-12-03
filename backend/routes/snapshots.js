const express = require('express');
const router = express.Router();
const InventarioSnapshot = require('../models/InventarioSnapshot');
const { auth } = require('../middleware/auth');

// Todas las rutas aquí requieren al menos estar logueado
router.use(auth);

// GET /api/snapshots - Obtener una lista de todos los snapshots disponibles
router.get('/', async (req, res) => {
  try {
    // Solo traemos los campos principales, no el array gigante de inventario
    const snapshots = await InventarioSnapshot.find()
      .select('fecha nombre valorTotalInventario createdAt')
      .sort({ fecha: -1 });
      
    res.json(snapshots);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error obteniendo la lista de snapshots.' });
  }
});

// GET /api/snapshots/:id - Obtener un snapshot específico con todo su contenido
router.get('/:id', async (req, res) => {
  try {
    const snapshot = await InventarioSnapshot.findById(req.params.id);

    if (!snapshot) {
      return res.status(404).json({ mensaje: 'Snapshot no encontrado.' });
    }

    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error obteniendo el detalle del snapshot.' });
  }
});

module.exports = router;
