const Joi = require('joi');

const appointmentSchema = {
  create: Joi.object({
    patientId: Joi.string().required(),
    doctorId: Joi.string().required(),
    appointmentDate: Joi.date().iso().required(),
    appointmentTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    appointmentReason: Joi.string().required()
  }),

  update: Joi.object({
    appointmentDate: Joi.date().iso(),
    appointmentTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    appointmentReason: Joi.string()
  }),

  getByDateRange: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    doctorId: Joi.string(),
    patientId: Joi.string()
  })
};

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }
    next();
  };
};

module.exports = {
  appointmentSchema,
  validateRequest
};
