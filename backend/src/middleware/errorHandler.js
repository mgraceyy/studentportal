function errorHandler(err, req, res, _next) {
  const isDbUnavailable =
    err?.code === 'ECONNREFUSED' ||
    err?.code === '57P01' ||
    (Array.isArray(err?.errors) && err.errors.some((e) => e?.code === 'ECONNREFUSED'));

  if (isDbUnavailable) {
    console.error('Database connection error:', err);
    return res.status(503).json({
      error: 'Database is unavailable. Please start PostgreSQL and try again.',
    });
  }

  console.error(err?.stack || err);
  res.status(err?.status || 500).json({
    error: err?.message || 'Internal server error',
  });
}

module.exports = errorHandler;
