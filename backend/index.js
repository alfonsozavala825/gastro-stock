const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const bcrypt = require('bcryptjs'); // Necesario para el admin
const Usuario = require('./models/Usuario'); // Importado UNA sola vez aquí arriba
const historicoRoutes = require('./routes/historico');

dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/historico', historicoRoutes);

// Conexión a Base de Datos
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch((err) => console.error('Error conectando a Mongo:', err));

// --- RUTAS ---
const ingredientesRoutes = require('./routes/ingredientes');
const inventarioRoutes = require('./routes/inventario');
const authRoutes = require('./routes/auth'); // Nueva ruta de seguridad

app.use('/api/ingredientes', ingredientesRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('¡Hola! El servidor del Inventario está funcionando 🚀');
});

// --- LÓGICA DE ADMIN AUTOMÁTICO ---
const crearAdminSiNoExiste = async () => {
  try {
    const existe = await Usuario.findOne({ email: 'admin@admin.com' });
    if (!existe) {
      console.log("⚠️ No hay usuarios. Creando ADMIN por defecto...");
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin1234', salt);
      
      await new Usuario({
        email: 'admin@admin.com',
        password: passwordHash,
        nombre: 'Administrador'
      }).save();
      console.log("✅ Usuario Admin creado: admin@admin.com / admin1234");
    }
  } catch (error) {
    console.error("Error verificando admin:", error);
  }
};

// Ejecutamos la verificación
crearAdminSiNoExiste();

// --- ARRANCAR SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
