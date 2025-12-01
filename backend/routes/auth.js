const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth, admin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Clave secreta para firmar los tokens (Leer siempre de las variables de entorno)
// Asegúrate de que esta variable exista en Render como JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;

// RUTA LOGIN
router.post('/login',
  // --- VALIDACIÓN ---
  body('email', 'El email no es válido').isEmail(),
  body('password', 'La contraseña no puede estar vacía').not().isEmpty(),
  // --------------------
  async (req, res) => {
    // Si hay errores de validación, los devolvemos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
  
    const { email, password } = req.body;

    try {
      // 1. Buscamos al usuario
      const usuario = await Usuario.findOne({ email });
    
      if (!usuario) {
        return res.status(400).json({ mensaje: 'Credenciales inválidas' });
      }

      // 2. Verificamos la contraseña
      const esCorrecta = await bcrypt.compare(password, usuario.password);
      if (!esCorrecta) {
        return res.status(400).json({ mensaje: 'Credenciales inválidas' });
      }

      // 3. Si todo está bien, creamos el TOKEN
      const payload = {
        user: {
          id: usuario.id,
          role: usuario.role // <-- Incluimos el rol en el token
        }
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

      res.json({ 
        token,
        usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, role: usuario.role } 
      });

    } catch (error) {
      res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

// Obtener el usuario autenticado (para verificar el token en el frontend)
router.get('/me', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.id).select('-password');
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener datos del usuario' });
  }
});

// RUTA PARA REGISTRAR NUEVOS USUARIOS (solo admins)
router.post('/register',
  [
    admin, // <-- Middleware que creamos para verificar si el usuario es admin
    body('nombre', 'El nombre es obligatorio').not().isEmpty(),
    body('email', 'El email no es válido').isEmail(),
    body('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    body('role', 'El rol no es válido').isIn(['admin', 'user'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    const { email, password, nombre, role } = req.body;

    try {
      let usuario = await Usuario.findOne({ email });
      if (usuario) {
        return res.status(400).json({ mensaje: 'Ya existe un usuario con ese email' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      usuario = new Usuario({
        nombre,
        email,
        password: passwordHash,
        role
      });

      await usuario.save();
      res.status(201).json({ mensaje: 'Usuario creado exitosamente' });

    } catch (error) {
      res.status(500).json({ mensaje: 'Error en el servidor' });
    }
  }
);

module.exports = router;
