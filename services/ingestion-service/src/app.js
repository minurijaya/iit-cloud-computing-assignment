const express = require('express');
const formatResponse = require('./middleware/response');
const { executeInsert } = require('./services/redshift');
const { ingestSchema } = require('./validation/schemas');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(formatResponse);

app.post('/ingest', async (req, res) => {
  try {
    const { error, value } = ingestSchema.validate(req.body);
    if (error) {
      return res.sendError(400, error.details[0].message);
    }

    const { tableName, records } = value;
    const response = await executeInsert(tableName, records);

    res.sendSuccess({
      message: `Successfully ingested ${records.length} records`,
      id: response.Id,
    });
  } catch (error) {
    console.error('Error ingesting data:', error);
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    res.sendError(statusCode, error.message);
  }
});

app.get('/health', (req, res) => {
  res.sendSuccess({ status: 'healthy' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
