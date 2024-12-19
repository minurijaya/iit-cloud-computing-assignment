const formatResponse = (req, res, next) => {
  res.sendSuccess = (data) => {
    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data,
    });
  };

  res.sendError = (status, message) => {
    res.status(status).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: message,
    });
  };
  next();
};

module.exports = formatResponse;
