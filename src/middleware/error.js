function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: 'Error interno', error: err.message });
}

module.exports = errorHandler;
