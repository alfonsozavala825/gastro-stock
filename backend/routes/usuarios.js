const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const { auth, admin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Todas las rutas en este archivo requieren que el usuario sea admin.
// Aplicamos ambos middlewares a todas las rutas.
router.use(auth, admin);

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    // Excluimos el password del resultado
    const usuarios = await Usuario.find().select('-password');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// POST /api/usuarios - Crear un nuevo usuario (admin)
router.post('/', async (req, res) => {
    const { email, password, nombre, rol } = req.body;

    if (!email || !password || !nombre || !rol) {
        return res.status(400).json({ mensaje: 'Todos los campos son requeridos: email, password, nombre, rol.' });
    }

    try {
        let usuario = await Usuario.findOne({ email });
        if (usuario) {
            return res.status(400).json({ mensaje: 'El usuario ya existe.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        usuario = new Usuario({
            email,
            password: passwordHash,
            nombre,
            rol
        });

        await usuario.save();

        // No devolvemos el password
        const usuarioCreado = {
            _id: usuario._id,
            email: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol
        };

        res.status(201).json({ mensaje: 'Usuario creado exitosamente', usuario: usuarioCreado });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
});

// PUT /api/usuarios/:id - Actualizar un usuario (ej. cambiar rol)
router.put('/:id', async (req, res) => {
  try {
    const { rol, nombre } = req.body;
    const updateData = {};

    if (rol) updateData.rol = rol;
    if (nombre) updateData.nombre = nombre;

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// DELETE /api/usuarios/:id - Eliminar un usuario
router.delete('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;
