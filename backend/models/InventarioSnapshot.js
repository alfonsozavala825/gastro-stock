const mongoose = require('mongoose');

// Este sub-esquema define la estructura de cada item DENTRO del snapshot.
// Es una copia desnormalizada para que el snapshot no se rompa si un ingrediente se borra.
const itemInventarioSnapshotSchema = new mongoose.Schema({
  nombreIngrediente: { type: String, required: true },
  unidad: { type: String, required: true },
  costo: { type: Number, required: true },
  area: { type: String, required: true },
  cantidad: { type: Number, required: true },
  valorTotal: { type: Number, required: true }
}, { _id: false }); // No necesitamos IDs para cada sub-item

const inventarioSnapshotSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: true,
    unique: true // Para no tener dos snapshots en el mismo milisegundo.
  },
  nombre: { // Un nombre descriptivo opcional, ej: "Cierre de mes - Noviembre"
    type: String,
    trim: true
  },
  inventario: [itemInventarioSnapshotSchema], // Un array con el estado de cada item
  valorTotalInventario: {
    type: Number,
    required: true
  }
}, {
  timestamps: true // Para saber cuándo se creó el documento del snapshot
});

module.exports = mongoose.model('InventarioSnapshot', inventarioSnapshotSchema);
