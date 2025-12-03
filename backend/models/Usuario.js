const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    default: 'Admin'
  },
  rol: {
    type: String,
    required: true,
    enum: ['admin', 'empleado'],
    default: 'empleado'
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
