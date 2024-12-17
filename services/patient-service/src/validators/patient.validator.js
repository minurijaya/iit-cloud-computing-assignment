const Joi = require('joi');

const patientSchema = Joi.object({
  firstName: Joi.string().required().trim(),
  lastName: Joi.string().required().trim(),
  dateOfBirth: Joi.date().required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  email: Joi.string().email().required().trim(),
  phone: Joi.string().required(),
  address: Joi.object({
    street: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    zipCode: Joi.string()
  }),
  medicalHistory: Joi.array().items(
    Joi.object({
      condition: Joi.string().required(),
      diagnosedDate: Joi.date().required(),
      notes: Joi.string()
    })
  )
});

const validatePatient = (req, res, next) => {
  const { error } = patientSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = { validatePatient };
