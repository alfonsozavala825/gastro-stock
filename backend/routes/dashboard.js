const express = require('express');
const router = express.Router();
const Inventario = require('../models/Inventario');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const todo = await Inventario.find().populate('ingrediente');
    const granTotal = todo.reduce((acc, item) => acc + item.valorTotal, 0);
    
    const porArea = { ALMACEN: 0, COCINA: 0, ENSALADA: 0, ISLA: 0 };
    todo.forEach(i => { if(porArea[i.area] !== undefined) porArea[i.area] += i.valorTotal; });

    res.json({ totalDinero: granTotal, totalProductos: todo.length, porArea, inventarioGlobal: todo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error dashboard' });
  }
});

module.exports = router;
