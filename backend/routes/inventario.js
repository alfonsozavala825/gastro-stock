const express = require('express');
const router = express.Router();
const Inventario = require('../models/Inventario');
const Ingrediente = require('../models/Ingrediente');
const Historico = require('../models/Historico'); // <--- Importamos el nuevo modelo

// --- FUNCIÓN AUXILIAR PARA REGISTRAR HISTORIA ---
async function registrarHistoria(ingredienteId, area, tipo, cantAnt, cantNueva) {
  try {
    const diferencia = cantNueva - cantAnt;
    await new Historico({
      ingrediente: ingredienteId,
      area,
      tipoMovimiento: tipo,
      cantidadAnterior: cantAnt,
      cantidadNueva: cantNueva,
      diferencia
    }).save();
  } catch (error) {
    console.error("Error guardando histórico:", error);
  }
}

// 1. AGREGAR stock (POST) -> Registra 'ENTRADA'
router.post('/agregar', async (req, res) => {
  const { ingrediente, area, cantidad } = req.body;
  try {
    const infoIng = await Ingrediente.findById(ingrediente);
    if (!infoIng) return res.status(404).json({ mensaje: 'Ingrediente no existe' });

    let item = await Inventario.findOne({ ingrediente, area });
    let cantidadAnterior = 0;

    if (item) {
      cantidadAnterior = item.cantidad;
      item.cantidad += parseFloat(cantidad);
    } else {
      item = new Inventario({ ingrediente, area, cantidad: parseFloat(cantidad) });
    }

    item.valorTotal = item.cantidad * infoIng.costo;
    const resultado = await item.save();

    // --- GUARDAR HISTÓRICO ---
    await registrarHistoria(ingrediente, area, 'ENTRADA', cantidadAnterior, item.cantidad);

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error', error: error.message });
  }
});

// 2. ACTUALIZAR manual (PUT) -> Registra 'AJUSTE_MANUAL'
router.put('/:id', async (req, res) => {
  try {
    const item = await Inventario.findById(req.params.id).populate('ingrediente');
    if (!item) return res.status(404).json({ mensaje: 'No encontrado' });

    const cantidadAnterior = item.cantidad;
    const nuevaCantidad = parseFloat(req.body.cantidad);

    item.cantidad = nuevaCantidad;
    item.valorTotal = item.cantidad * item.ingrediente.costo;
    await item.save();

    // --- GUARDAR HISTÓRICO ---
    await registrarHistoria(item.ingrediente._id, item.area, 'AJUSTE_MANUAL', cantidadAnterior, item.cantidad);

    res.json(item);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error update' });
  }
});

// 3. ELIMINAR (DELETE) -> Registra 'ELIMINADO'
router.delete('/:id', async (req, res) => {
  try {
    const item = await Inventario.findById(req.params.id);
    if (item) {
      // Guardamos la historia antes de borrarlo
      await registrarHistoria(item.ingrediente, item.area, 'ELIMINADO', item.cantidad, 0);
      
      await Inventario.findByIdAndDelete(req.params.id);
    }
    res.json({ mensaje: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error delete' });
  }
});

// --- RUTAS DE LECTURA (GET) ---

// Reporte Dashboard
router.get('/dashboard', async (req, res) => {
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
router.get('/:area', async (req, res) => {
  try {
    const lista = await Inventario.find({ area: req.params.area.toUpperCase() }).populate('ingrediente');
    res.json(lista);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error area' });
  }
});

const { auth, admin } = require('../middleware/auth');
const InventarioSnapshot = require('../models/InventarioSnapshot');

// ... (código existente)

// 4. CREAR UN SNAPSHOT DEL INVENTARIO (Solo Admin)
router.post('/snapshot', [auth, admin], async (req, res) => {
  try {
    const { nombre } = req.body; // Nombre opcional para el snapshot

    // 1. Obtener todo el inventario actual
    const inventarioActual = await Inventario.find().populate('ingrediente');

    if (inventarioActual.length === 0) {
      return res.status(400).json({ mensaje: 'El inventario está vacío, no se puede crear un snapshot.' });
    }

    // 2. Mapear al formato del snapshot (desnormalizado)
    const inventarioParaSnapshot = inventarioActual.map(item => {
      // Si un ingrediente fue borrado pero aún existe en el inventario, manejarlo
      if (!item.ingrediente) {
        return {
          nombreIngrediente: 'Ingrediente Eliminado',
          unidad: 'N/A',
          costo: 0,
          area: item.area,
          cantidad: item.cantidad,
          valorTotal: 0
        };
      }
      return {
        nombreIngrediente: item.ingrediente.nombre,
        unidad: item.ingrediente.unidad,
        costo: item.ingrediente.costo,
        area: item.area,
        cantidad: item.cantidad,
        valorTotal: item.valorTotal
      };
    });

    // 3. Calcular el valor total
    const valorTotalInventario = inventarioParaSnapshot.reduce((acc, item) => acc + item.valorTotal, 0);

    // 4. Crear y guardar el snapshot
    const nuevoSnapshot = new InventarioSnapshot({
      fecha: new Date(),
      nombre: nombre, // Puede ser undefined si no se provee
      inventario: inventarioParaSnapshot,
      valorTotalInventario
    });

    await nuevoSnapshot.save();

    res.status(201).json({ mensaje: 'Snapshot del inventario creado exitosamente.', snapshot: nuevoSnapshot });

  } catch (error) {
    // Manejo de error de clave única duplicada
    if (error.code === 11000) {
      return res.status(409).json({ mensaje: 'Conflicto: Ya se creó un snapshot en este mismo momento. Inténtalo de nuevo.' });
    }
    console.error("Error creando snapshot:", error);
    res.status(500).json({ mensaje: 'Error en el servidor al crear el snapshot.' });
  }
});


module.exports = router;
