const { Schema, model, Types } = require('mongoose');

const fileSchema = new Schema({
  driveFileId: { type: String, required: true },
  name: String,
  mimeType: String,
  size: Number,
  webViewLink: String,
  webContentLink: String,
  uploadedAt: { type: Date, default: Date.now },
});

const revisionSchema = new Schema({
  namePsico: { type: String },
  revision: { type: String, required: true },
  tipoEntrevista: String,
  accionTomar: String,
  fechaRegistroRevision: { type: Date, default: Date.now },
  recomendaciones: String,
  resultados: String,
  observaciones: String,
  psycologorev: String,
  alumnno: { type: Types.ObjectId, ref: 'Alumno', required: true },
  files: [fileSchema],
}, { timestamps: true });

module.exports = model('Revision', revisionSchema);
