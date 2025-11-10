const Alumno = require('../models/alumno.model');

function required(fields, body) {
  for (const f of fields) {
    if (body[f] == null || body[f] === '') return `Campo requerido: ${f}`;
  }
  return null;
}

exports.createAlumno = async (req, res, next) => {
  try {
    const errMsg = required(['nameAlumnno','lastnameAlumno','dni'], req.body);
    if (errMsg) return res.status(400).json({ message: errMsg });


    const doc = await Alumno.create(req.body);
    res.status(201).json(doc);
  } catch (err) { next(err); }
};

exports.getAlumnos = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.dni) filter.dni = req.query.dni;
    if (req.query.apellido) filter.lastnameAlumno = new RegExp(req.query.apellido, 'i');
    const docs = await Alumno.find(filter).lean();
    res.json(docs);
  } catch (err) { next(err); }
};

exports.getAlumnoById = async (req, res, next) => {
  try {
    const doc = await Alumno.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Alumno no encontrado' });
    res.json(doc);
  } catch (err) { next(err); }
};

exports.updateAlumno = async (req, res, next) => {
  try {
    const doc = await Alumno.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ message: 'Alumno no encontrado' });
    res.json(doc);
  } catch (err) { next(err); }
};

exports.deleteAlumno = async (req, res, next) => {
  try {
    const doc = await Alumno.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Alumno no encontrado' });
    res.json({ deleted: true });
  } catch (err) { next(err); }
};
