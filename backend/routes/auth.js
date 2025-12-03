const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Clave secreta para firmar los tokens (En producción esto va en .env)
const JWT_SECRET = 'gastro_stock_secreto_super_seguro';

// RUTA LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscamos al usuario
    const usuario = await Usuario.findOne({ email });
    
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas (Usuario no existe)' });
    }

    // 2. Verificamos la contraseña
    const esCorrecta = await bcrypt.compare(password, usuario.password);
    if (!esCorrecta) {
      return res.status(400).json({ mensaje: 'Contraseña incorrecta' });
    }

    // 3. Si todo está bien, creamos el TOKEN (La tarjeta de acceso)
    const payload = {
      user: {
        id: usuario.id,
        rol: usuario.rol
      }
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.json({ 
      token, 
      usuario: { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } 
    });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// RUTA ESPECIAL: CREAR ADMIN INICIAL (Solo corre una vez)
router.post('/setup-admin', async (req, res) => {
  const existe = await Usuario.findOne({ email: 'admin@admin.com' });
  if (existe) return res.json({ mensaje: 'El admin ya existe' });

  // Encriptamos la contraseña "admin1234"
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin1234', salt);

  const admin = new Usuario({
    email: 'admin@admin.com',
    password: passwordHash,
    nombre: 'Administrador',
    rol: 'admin'
  });

  await admin.save();
  res.json({ mensaje: 'Admin creado: admin@admin.com / admin1234' });
});

module.exports = router;
