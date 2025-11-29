const mongoose = require('mongoose');

const ingredienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  detalle: {
    type: String, // Ej: "Marca Patito, botella de vidrio"
    trim: true
  },
  unidad: {
    type: String,
    required: true,
    enum: ['PIEZA', 'PAQUETE', 'MILILITRO', 'LITRO', 'GRAMO', 'KILO'] // Tus unidades permitidas
  },
  costo: {
    type: Number,
    required: true,
    min: 0
  },
  codigoQR: {
    type: String, // Aquí guardaremos la URL o el texto del código QR generado
  }
}, {
  timestamps: true // Esto agrega automáticamente fecha de creación y actualización
});

module.exports = mongoose.model('Ingrediente', ingredienteSchema);
