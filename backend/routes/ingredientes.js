const express = require('express');
const router = express.Router();
const Ingrediente = require('../models/Ingrediente');
const QRCode = require('qrcode');
const multer = require('multer');
const ExcelJS = require('exceljs');

// Guardamos en memoria RAM para leer rápido
const upload = multer({ storage: multer.memoryStorage() });

// --- FUNCIÓN TRADUCTORA DE UNIDADES ---
const normalizarUnidad = (textoExcel) => {
  if (!textoExcel) return 'PIEZA'; // Si viene vacío, asumimos Pieza

  // 1. Limpiamos: Quitamos puntos, espacios y pasamos a mayúsculas
  // Ej: " pz. " -> "PZ"
  const limpio = textoExcel.toString().trim().toUpperCase().replace('.', '');

  // 2. Diccionario de sinónimos
  const mapa = {
    'PZ': 'PIEZA', 'PZA': 'PIEZA', 'PIEZA': 'PIEZA', 'UNIDAD': 'PIEZA',
    'KG': 'KILO', 'KILO': 'KILO', 'KILOGRAMO': 'KILO', 'KGS': 'KILO',
    'G': 'GRAMO', 'GR': 'GRAMO', 'GRS': 'GRAMO', 'GRAMO': 'GRAMO',
    'L': 'LITRO', 'LT': 'LITRO', 'LTS': 'LITRO', 'LITRO': 'LITRO',
    'ML': 'MILILITRO', 'MILI': 'MILILITRO', 'MILILITRO': 'MILILITRO',
    'PAQ': 'PAQUETE', 'PAQUETE': 'PAQUETE', 'CAJA': 'PAQUETE'
  };

  // 3. Devolvemos la palabra correcta o 'PIEZA' si no la conocemos
  return mapa[limpio] || 'PIEZA';
};
// --------------------------------------

const { auth, admin } = require('../middleware/auth');

// RUTA IMPORTAR EXCEL (POST)
router.post('/importar', [admin, upload.single('archivoExcel')], async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ mensaje: 'No subiste ningún archivo' });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.worksheets[0];
    
    // Extraer encabezados de la primera fila
    const header = sheet.getRow(1).values.map(h => h.toString().trim());

    const datos = [];

    // Iterar sobre cada fila (a partir de la segunda)
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            let rowData = {};
            row.values.forEach((value, index) => {
                // Usamos el encabezado limpio para la clave del objeto
                const key = header[index-1]; // El índice de `values` es 1-based
                if (key) {
                   rowData[key] = value;
                }
            });
            datos.push(rowData);
        }
    });


    let contador = 0;
    
    for (const fila of datos) {
      // Buscamos columnas ignorando mayúsculas/minúsculas del encabezado
      const nombre = fila.Nombre || fila.nombre || fila.NOMBRE;
      const costo = fila.Costo || fila.costo || fila.COSTO;
      const detalle = fila.Detalle || fila.detalle || '';
      const unidadRaw = fila.Unidad || fila.unidad || 'PIEZA';

      if (nombre && costo) {
        // Generar QR
        const qrData = JSON.stringify({ nombre: nombre, detalle: detalle });
        const qrImage = await QRCode.toDataURL(qrData);

        // Usamos el traductor aquí
        const unidadCorrecta = normalizarUnidad(unidadRaw);

        const nuevo = new Ingrediente({
          nombre: nombre,
          detalle: detalle,
          unidad: unidadCorrecta, // <--- Aquí guardamos la versión corregida
          costo: costo,
          codigoQR: qrImage
        });

        await nuevo.save();
        contador++;
      }
    }

    res.json({ mensaje: `¡Éxito! Se importaron ${contador} productos.` });

  } catch (error) {
    console.error(error); // Ver error en terminal
    // Si falla por validación, le decimos al usuario por qué
    if (error.name === 'ValidationError') {
       return res.status(400).json({ mensaje: 'Error de validación: Revisa las unidades en tu Excel.' });
    }
    res.status(500).json({ mensaje: 'Error al procesar el Excel' });
  }
});

// RUTAS CRUD STANDARD
router.post('/', admin, async (req, res) => {
  try {
    const nuevoIngrediente = new Ingrediente(req.body);
    const qrData = JSON.stringify({ id: nuevoIngrediente._id, nombre: nuevoIngrediente.nombre });
    nuevoIngrediente.codigoQR = await QRCode.toDataURL(qrData);
    const ingredienteGuardado = await nuevoIngrediente.save();
    res.status(201).json(ingredienteGuardado);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al guardar', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const ingredientes = await Ingrediente.find(); 
    res.json(ingredientes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error lista' });
  }
});

router.put('/:id', admin, async (req, res) => {
  try {
    const actualizado = await Ingrediente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error update' });
  }
});

router.delete('/:id', admin, async (req, res) => {
  try {
    await Ingrediente.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error delete' });
  }
});

module.exports = router;