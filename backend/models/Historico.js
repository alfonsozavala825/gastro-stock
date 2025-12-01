const mongoose = require('mongoose');

const historicoSchema = new mongoose.Schema({
  ingrediente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingrediente',
    required: true
  },
  area: {
    type: String,
    required: true
  },
  tipoMovimiento: {
    type: String,
    enum: ['ENTRADA', 'SALIDA', 'AJUSTE_MANUAL', 'ELIMINADO'],
    required: true
  },
  cantidadAnterior: { type: Number, default: 0 },
  cantidadNueva: { type: Number, required: true },
  diferencia: { type: Number, required: true }, // Ej: +5 o -2
  responsable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Historico', historicoSchema);
