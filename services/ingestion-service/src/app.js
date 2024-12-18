const express = require('express');
const { RedshiftData } = require('@aws-sdk/client-redshift-data');
const Joi = require('joi');
const winston = require('winston');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Response formatter middleware
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

app.use(formatResponse);

// Initialize Redshift client with timeout
const redshiftClient = new RedshiftData({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  maxAttempts: 3,
  timeout: 5000,
});

// Validation schema for ingestion request
const ingestSchema = Joi.object({
  tableName: Joi.string().pattern(/^[a-zA-Z_][a-zA-Z0-9_]*$/).required(),
  records: Joi.array().items(Joi.object()).min(1).required(),
});

// SQL generation helper
const generateInsertSQL = (tableName, records) => {
  const columns = Object.keys(records[0]);
  const placeholders = records.map(() => 
    `(${columns.map(() => '?').join(', ')})`
  ).join(', ');
  
  const values = records.flatMap(record => 
    columns.map(col => record[col])
  );

  return {
    sql: `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${placeholders}`,
    values,
  };
};

app.post('/ingest', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = ingestSchema.validate(req.body);
    if (error) {
      return res.sendError(400, error.details[0].message);
    }

    const { tableName, records } = value;
    const { sql, values } = generateInsertSQL(tableName, records);

    // Execute SQL using Redshift Data API
    const response = await redshiftClient.executeStatement({
      Database: process.env.REDSHIFT_DATABASE,
      SecretArn: process.env.REDSHIFT_SECRET_ARN,
      ClusterIdentifier: process.env.REDSHIFT_CLUSTER_IDENTIFIER,
      Sql: sql,
      Parameters: values,
    });

    logger.info({
      message: 'Data ingestion successful',
      tableName,
      recordCount: records.length,
      id: response.Id,
    });
    
    res.sendSuccess({
      message: `Successfully ingested ${records.length} records`,
      id: response.Id,
    });
  } catch (error) {
    logger.error('Error ingesting data:', {
      error: error.message,
      stack: error.stack,
    });

    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    res.sendError(statusCode, error.message);
  }
});

app.get('/health', (req, res) => {
  res.sendSuccess({ status: 'healthy' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
