const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ mensaje: 'No hay token, permiso no válido' });
  }

  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ mensaje: 'No hay token, permiso no válido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token no es válido' });
  }
};

const admin = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ mensaje: 'Acceso denegado. Se requiere rol de administrador.' });
    }
  });
};

module.exports = { auth, admin };
