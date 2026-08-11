function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
}

function errorHandler(err, req, res, next) {
  console.error("Unhandled error:", err);

  if (res.headersSent) {
    return next(err);
  }

  const status = Number.isInteger(err.status)
    ? err.status
    : 500;

  res.status(status).json({
    success: false,
    message:
      status === 500
        ? "Internal server error"
        : err.message || "Request failed"
  });
}

module.exports = {
  notFound,
  errorHandler
};
