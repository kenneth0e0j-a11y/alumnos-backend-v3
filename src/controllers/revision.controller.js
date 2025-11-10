const Revision = require('../models/revision.model');
const { getDriveFileStream ,uploadBufferToDrive, deleteDriveFile } = require('../utils/drive');
const puppeteer = require('puppeteer'); // <-- CAMBIO 1: Se usa 'puppeteer-core'

exports.createRevision = async (req, res, next) => {
  try {
    if (!req.body.alumnno) {
      return res.status(400).json({ message: 'alumnno (id) requerido' });
    }
    if (!req.body.revision) {
      return res.status(400).json({ message: 'revision requerido' });
    }

    const files = [];

    if (req.files && req.files.length > 0) {
      for (const f of req.files) {
        const g = await uploadBufferToDrive(f.buffer, f.originalname, f.mimetype);
        files.push({
          driveFileId: g.id,
          name: g.name,
          mimeType: g.mimeType,
          size: Number(g.size),
          webViewLink: g.webViewLink,
          webContentLink: g.webContentLink,
        });
      }
    }

    const doc = await Revision.create({
      ...req.body,
      files,
    });

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};
exports.getRevisiones = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.alumno) filter.alumnno = req.query.alumno;

    const docs = await Revision.find(filter)
      .populate('alumnno', 'nameAlumnno lastnameAlumno')
      .lean();

    res.json(docs);
  } catch (err) { next(err); }
};

exports.getRevisionById = async (req, res, next) => {
  try {
    const doc = await Revision.findById(req.params.id)
      .populate('alumnno', 'nameAlumnno lastnameAlumno')
      .lean();
    if (!doc) return res.status(404).json({ message: 'Revisión no encontrada' });
    res.json(doc);
  } catch (err) { next(err); }
};

exports.updateRevision = async (req, res, next) => {
  try {
    const doc = await Revision.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('alumnno', 'nameAlumnno lastnameAlumno');
    if (!doc) return res.status(404).json({ message: 'Revisión no encontrada' });
    res.json(doc);
  } catch (err) { next(err); }
};

exports.deleteRevision = async (req, res, next) => {
  try {
    const doc = await Revision.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Revisión no encontrada' });
    res.json({ deleted: true });
  } catch (err) { next(err); }
};

// -------- FILES --------
exports.uploadFiles = async (req, res, next) => {
  try {
    const revision = await Revision.findById(req.params.id);
    if (!revision) return res.status(404).json({ message: 'Revisión no encontrada' });

    const uploaded = [];
    for (const f of req.files || []) {
      const g = await uploadBufferToDrive(f.buffer, f.originalname, f.mimetype);
      revision.files.push({
        driveFileId: g.id,
        name: g.name,
        mimeType: g.mimeType,
        size: Number(g.size),
        webViewLink: g.webViewLink,
        webContentLink: g.webContentLink,
      });
      uploaded.push(g);
    }
    await revision.save();
    res.json({ ok: true, uploaded, files: revision.files });
  } catch (err) { next(err); }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const { id, fileId } = req.params;

    const revision = await Revision.findById(id); // ¡sin .lean()!
    if (!revision) return res.status(404).json({ message: 'Revisión no encontrada' });

    const file = revision.files.id(fileId);
    if (!file) return res.status(404).json({ message: 'Archivo no encontrado' });

    // elimina en Drive (ignora error si ya no existe)
    await deleteDriveFile(file.driveFileId).catch(() => {});

    // quitar del array
    revision.files.pull(fileId);   // <- aquí cambia
    await revision.save();

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.viewFile = async (req, res, next) => {
  try {
    const { id, fileId } = req.params;

    const revision = await Revision.findById(id);
    if (!revision) return res.status(404).json({ message: 'Revisión no encontrada' });

    const file = revision.files.id(fileId);
    if (!file) return res.status(404).json({ message: 'Archivo no encontrado' });

    const { meta, stream } = await getDriveFileStream(file.driveFileId);

    res.set({
      'Content-Type': meta.mimeType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(meta.name)}"`,
      'Content-Length': meta.size,
    });

    stream.on('error', next).pipe(res);
  } catch (err) {
    next(err);
  }
};

// --- FUNCIÓN DE PDF CORREGIDA ---
exports.generarRevisionPDF = async (req, res, next) => {
  let browser = null; // Definimos browser aquí para el finally
  try {
    const { id } = req.params;
    
    const revision = await Revision.findById(id).populate('alumnno', 'nameAlumnno lastnameAlumno');

    if (!revision) {
      return res.status(404).json({ message: "Revisión no encontrada" });
    }

    let resultadosLabel = revision.resultados;
    if (revision.resultados === 'CITACION_PADRES') {
      resultadosLabel = 'Citación de padres y/o apoderados';
    } else if (revision.resultados === 'SEGUIMIENTO_EVAL') {
      resultadosLabel = 'Seguimiento para evaluación de resultados';
    }

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
            h1 { font-size: 22px; color: #111; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            h2 { font-size: 18px; color: #333; margin-top: 30px; }
            .section { margin-bottom: 15px; }
            .label { font-weight: bold; color: #555; display: block; margin-bottom: 5px; }
            .content { 
              padding: 12px; 
              background: #f9f9f9; 
              border: 1px solid #eee;
              border-radius: 5px; 
              white-space: pre-wrap;
            }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          </style>
        </head>
        <body>
          <h1>Detalle de Revisión</h1>
          
          <div class="info-grid">
            <div class="section">
              <span class="label">ID:</span> ${revision._id}
            </div>
            <div class="section">
              <span class="label">Fecha:</span> ${new Date(revision.fechaRegistroRevision).toLocaleDateString('es-PE')}
            </div>
            <div class="section">
              <span class="label">Tipo de entrevista:</span> ${revision.tipoEntrevista || '—'}
            </div>
            <div class="section">
              <span class="label">Psicólogo:</span> ${revision.namePsico || '—'}
            </div>
          </div>
          
          <h2>Alumno</h2>
          <p>${revision.alumnno ? `${revision.alumnno.nameAlumnno} ${revision.alumnno.lastnameAlumno}` : 'N/A'}</p>

          <div class="section">
            <p class="label">Revisión:</p>
            <div class="content">${revision.revision || '—'}</div>
          </div>
          <div class="section">
            <p class="label">Antecedentes de la Entrevista:</p>
            <div class="content">${revision.accionTomar || '—'}</div>
          </div>
          <div class="section">
            <p class="label">Recomendaciones:</p>
            <div class="content">${revision.recomendaciones || '—'}</div>
          </div>
          <div class="section">
            <p class="label">Resultados:</p>
            <div class="content">${resultadosLabel || '—'}</div>
          </div>
          <div class="section">
            <p class="label">Observaciones:</p>
            <div class="content">${revision.observaciones || '—'}</div>
          </div>
        </body>
      </html>
    `;

    // --- CAMBIO 3: Se añade la ruta al ejecutable ---
    browser = await puppeteer.launch({ 
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
    // Cerramos el navegador ANTES de enviar la respuesta
    await browser.close(); 
    browser = null; // Limpiamos la variable

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=revision-${id}.pdf`);
    res.send(pdfBuffer);

  } catch (err) { 
    // Aseguramos que el navegador se cierre si falla
    if (browser) {
      await browser.close();
    }
    next(err); 
  }
};