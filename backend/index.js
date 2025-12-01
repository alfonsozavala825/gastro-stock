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
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/ingredientes', ingredientesRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
    res.send('¡Hola! El servidor del Inventario está funcionando 🚀');
});

// --- ARRANCAR SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
