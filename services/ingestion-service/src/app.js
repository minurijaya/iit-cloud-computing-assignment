const express = require('express');
const formatResponse = require('./middleware/response');
const { executeInsert } = require('./services/redshift');
const { ingestSchema } = require('./validation/schemas');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(formatResponse);

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.method === 'POST') {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

app.post('/ingest', async (req, res) => {
  try {
    const { error, value } = ingestSchema.validate(req.body);
    if (error) {
      console.error('Validation error:', error.details[0].message);
      return res.sendError(400, error.details[0].message);
    }

    const { tableName, records } = value;
    
    // Log received data
    console.log('\nReceived ingestion request:');
    console.log('Table:', tableName);
    console.log('Record count:', records.length);
    console.log('Sample record:', JSON.stringify(records[0], null, 2));

    const response = await executeInsert(tableName, records);
    console.log({response});
    console.log(`✓ Successfully ingested ${records.length} records into ${tableName}`);

    res.sendSuccess({
      message: `Successfully ingested ${records.length} records`,
      id: response.Id,
    });
  } catch (error) {
    console.error('Error ingesting data:', error.message);
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    res.sendError(statusCode, error.message);
  }
});

app.get('/health', (req, res) => {
  console.log(`[${new Date().toISOString()}] Health check request`);
  res.sendSuccess({ status: 'healthy' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Ingestion service running on port ${port}`);
});
