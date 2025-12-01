const express = require('express');
const router = express.Router();
const Historico = require('../models/Historico');

const { auth } = require('../middleware/auth');

// OBTENER ÚLTIMOS 100 MOVIMIENTOS
router.get('/', auth, async (req, res) => {
  try {
    const movimientos = await Historico.find()
      .populate('ingrediente') // Traer nombre del ingrediente
      .populate('responsable', 'nombre email') // Traer nombre y email del usuario
      .sort({ fecha: -1 }) // Ordenar del más reciente al más antiguo
      .limit(100); // Límite de seguridad
    
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error obteniendo histórico' });
  }
});

module.exports = router;
