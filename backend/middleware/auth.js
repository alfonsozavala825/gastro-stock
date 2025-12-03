const jwt = require('jsonwebtoken');

// Usamos la misma clave que en auth.js. Debería estar en .env
const JWT_SECRET = 'gastro_stock_secreto_super_seguro';

// Middleware para validar el token y adjuntar el usuario
const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'No hay token o el formato es incorrecto.' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Ahora el payload del token tiene un objeto 'user'
    req.user = decoded.user; 
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token no es válido o ha expirado.' });
  }
};

// Middleware para verificar si el usuario es administrador
// ESTE MIDDLEWARE DEBE USARSE *DESPUÉS* DEL MIDDLEWARE 'auth'
const admin = (req, res, next) => {
  // El middleware 'auth' ya debe haber puesto 'req.user'
  if (req.user && req.user.rol === 'admin') {
    next();
  } else {
    res.status(403).json({ mensaje: 'Acceso denegado. Se requiere rol de administrador.' });
  }
};

module.exports = { auth, admin };