const errorHandler = (err, req, res, next) => {
  // If res.statusCode is already set (e.g., 400, 401, 404), use it. Otherwise, default to 500.
  const statusCode = res.statusCode && res.statusCode >= 400 ? res.statusCode : 500;

  res.status(statusCode);

  res.json({
    message: err.message,
    // Only show stack trace in development environment
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { // Export as an object, so it can be destructured
  errorHandler,
};