const Joi = require('joi');

const appointmentSchema = Joi.object({
  patientId: Joi.string().required(),
  doctorId: Joi.string().required(),
  appointmentDateTime: Joi.date().iso().required(),
  // appointmentTime: Joi.string()
  //   .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  //   .required()
  //   .messages({
  //     'string.pattern.base': 'Time must be in HH:mm format'
  //   }),
  appointmentReason: Joi.string().required().trim(),
  status: Joi.string()
    .valid('scheduled', 'completed', 'cancelled')
    .default('scheduled'),
  notes: Joi.string().required().trim(),
});

const validateAppointment = (req, res, next) => {
  const { error } = appointmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = { validateAppointment };
