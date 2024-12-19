const Joi = require('joi');

const ingestSchema = Joi.object({
  tableName: Joi.string().pattern(/^[a-zA-Z_][a-zA-Z0-9_]*$/).required(),
  records: Joi.array().items(Joi.object()).min(1).required(),
});

module.exports = { ingestSchema };
