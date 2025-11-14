const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const alumnoRoutes = require('./routes/alumno.routes');
const revisionRoutes = require('./routes/revision.routes');
const permissionRoutes = require('./routes/permission.routes');
const roleRoutes = require('./routes/role.routes');
const meRoutes = require('./routes/me.routes');
const errorHandler = require('./middleware/error');

const app = express();

// --- CAMBIO DE CORS AQUÍ ---
app.use(cors({
  origin: [
    'http://localhost:3000', // Para cuando pruebas en tu PC
    'https://psicologia.colegiosgarcilaso.edu.pe', // Tu subdominio (según tus fotos de cPanel)
    'https://sistemapsico.colegiosgarcilaso.edu.pe' // El que salía en tu error de consola (puse los dos por si acaso)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// ---------------------------

app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/alumnos', alumnoRoutes);
app.use('/api/revisiones', revisionRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api', meRoutes); 

// Handler final
app.use(errorHandler);

module.exports = app;