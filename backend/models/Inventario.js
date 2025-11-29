const mongoose = require('mongoose');

const inventarioSchema = new mongoose.Schema({
  ingrediente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingrediente', // <--- Esto conecta con tu otro modelo
    required: true
  },
  area: {
    type: String,
    required: true,
    enum: ['ALMACEN', 'COCINA', 'ENSALADA', 'ISLA'] // Las áreas que definiste
  },
  cantidad: {
    type: Number,
    required: true,
    default: 0 // Acepta decimales (ej: 0.5)
  },
  // El costo total lo calcularemos dinámicamente, pero podemos guardarlo si quieres historial
  valorTotal: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inventario', inventarioSchema);
