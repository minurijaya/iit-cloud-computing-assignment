const Joi = require('joi');

const doctorSchema = Joi.object({
  firstName: Joi.string().required().trim(),
  lastName: Joi.string().required().trim(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  specialty: Joi.string().required().trim(),
  email: Joi.string().email().required().trim(),
  phone: Joi.string().required()
});

const validateDoctor = (req, res, next) => {
  const { error } = doctorSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = { validateDoctor };
