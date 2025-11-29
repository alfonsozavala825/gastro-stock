const express = require('express');
const router = express.Router();
const Historico = require('../models/Historico');

// OBTENER ÚLTIMOS 100 MOVIMIENTOS
router.get('/', async (req, res) => {
  try {
    const movimientos = await Historico.find()
      .populate('ingrediente') // Traer nombre del ingrediente
      .sort({ fecha: -1 }) // Ordenar del más reciente al más antiguo
      .limit(100); // Límite de seguridad
    
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error obteniendo histórico' });
  }
});

module.exports = router;
