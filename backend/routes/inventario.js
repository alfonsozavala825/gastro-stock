const express = require('express');
const router = express.Router();
const Inventario = require('../models/Inventario');
const Ingrediente = require('../models/Ingrediente');
const Historico = require('../models/Historico'); // <--- Importamos el nuevo modelo

const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');

// --- FUNCIÓN AUXILIAR PARA REGISTRAR HISTORIA ---
// Ahora acepta la sesión como argumento
async function registrarHistoria(ingredienteId, area, tipo, cantAnt, cantNueva, usuarioId, session) {
  try {
    const diferencia = cantNueva - cantAnt;
    await new Historico({
      ingrediente: ingredienteId,
      area,
      tipoMovimiento: tipo,
      cantidadAnterior: cantAnt,
      cantidadNueva: cantNueva,
      diferencia,
      responsable: usuarioId
    }).save({ session }); // <-- Usamos la sesión
  } catch (error) {
    // El error se manejará en el catch del controlador que usa la transacción
    throw error;
  }
}

// 1. AGREGAR stock (POST) -> Registra 'ENTRADA'
router.post('/agregar', auth, async (req, res) => {
  const { ingrediente, area, cantidad } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cantidadNum = parseFloat(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      throw new Error('La cantidad debe ser un número positivo.');
    }

    const infoIng = await Ingrediente.findById(ingrediente).session(session);
    if (!infoIng) return res.status(404).json({ mensaje: 'Ingrediente no existe' });

    const itemPrevio = await Inventario.findOne({ ingrediente, area }).session(session);
    const cantidadAnterior = itemPrevio ? itemPrevio.cantidad : 0;
    
    const itemActualizado = await Inventario.findOneAndUpdate(
      { ingrediente, area },
      { 
        $inc: { cantidad: cantidadNum },
        $set: { valorTotal: (cantidadAnterior + cantidadNum) * infoIng.costo }
      },
      { new: true, upsert: true, session: session }
    );

    await registrarHistoria(ingrediente, area, 'ENTRADA', cantidadAnterior, itemActualizado.cantidad, req.user.id, session);

    await session.commitTransaction();
    res.json(itemActualizado);

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ mensaje: 'Error al agregar stock', error: error.message });
  } finally {
    session.endSession();
  }
});

// 2. ACTUALIZAR manual (PUT) -> Registra 'AJUSTE_MANUAL'
router.put('/:id', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const nuevaCantidad = parseFloat(req.body.cantidad);
     if (isNaN(nuevaCantidad) || nuevaCantidad < 0) {
      throw new Error('La cantidad debe ser un número válido y no negativo.');
    }

    const itemPrevio = await Inventario.findById(req.params.id).populate('ingrediente').session(session);
    if (!itemPrevio) return res.status(404).json({ mensaje: 'No encontrado' });

    const cantidadAnterior = itemPrevio.cantidad;

    const itemActualizado = await Inventario.findByIdAndUpdate(
      req.params.id,
      {
        cantidad: nuevaCantidad,
        valorTotal: nuevaCantidad * itemPrevio.ingrediente.costo
      },
      { new: true, session: session }
    );

    await registrarHistoria(itemActualizado.ingrediente, itemActualizado.area, 'AJUSTE_MANUAL', cantidadAnterior, itemActualizado.cantidad, req.user.id, session);
    
    await session.commitTransaction();
    res.json(itemActualizado);

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ mensaje: 'Error al actualizar', error: error.message });
  } finally {
    session.endSession();
  }
});


// 3. ELIMINAR (DELETE) -> Registra 'ELIMINADO'
router.delete('/:id', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const item = await Inventario.findById(req.params.id).session(session);
    if (item) {
      await registrarHistoria(item.ingrediente, item.area, 'ELIMINADO', item.cantidad, 0, req.user.id, session);
      await Inventario.findByIdAndDelete(req.params.id).session(session);
    }
    
    await session.commitTransaction();
    res.json({ mensaje: 'Eliminado' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ mensaje: 'Error al eliminar', error: error.message });
  } finally {
    session.endSession();
  }
});

// --- RUTAS DE LECTURA (GET) ---

// Reporte Dashboard
router.get('/dashboard', auth, async (req, res) => {
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

// Leer por Área
router.get('/:area', auth, async (req, res) => {
  try {
    const lista = await Inventario.find({ area: req.params.area.toUpperCase() }).populate('ingrediente');
    res.json(lista);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error area' });
  }
});

module.exports = router;
