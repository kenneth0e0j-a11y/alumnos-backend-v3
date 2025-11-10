const { Schema, model } = require('mongoose');

const alumnoSchema = new Schema({
  nameAlumnno: { type: String, required: true, trim: true },
  lastnameAlumno: { type: String, required: true, trim: true },
  dni: { type: String, required: true, unique: false, trim: true },
  nota: String,
  estadoMedico: String,
  estadoAlumno: String,
  fechaRegistro: { type: Date, default: Date.now },
  grado: String,
  nivel: String,
  seccion: String,
  nombrePadre: String,
  apellidoPadre: String,
  numeroContacto: String,
  nombreMadre: String,
  apellidoMadre: String,
  numeroContactoMadre: String,
  apoderadonombre: String,
  apoderadoapellido: String,
  numerocontactoapoderado: String,
  parentezco: String,
  tipoAlumno: { type: String, default: 'Nuevo' },
  tipoFamilia: { type: String, default: 'Estable' },
  sede: { type: String, default: 'Pro' },
}, { timestamps: true });

module.exports = model('Alumno', alumnoSchema);
