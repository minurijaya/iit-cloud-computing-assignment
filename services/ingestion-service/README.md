# Ingestion Service

This service provides an API endpoint for ingesting data into Redshift using Node.js and AWS SDK.

## Environment Variables

Copy `.env.example` to `.env` and configure the following environment variables:

```
# AWS Configuration
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Redshift Configuration
REDSHIFT_DATABASE=your_database
REDSHIFT_SECRET_ARN=arn:aws:secretsmanager:region:account:secret:name
REDSHIFT_CLUSTER_IDENTIFIER=your-cluster-identifier

# Server Configuration
PORT=3000
```

## API Endpoints

### POST /ingest
Ingest data into a specified Redshift table.

Request body:
```json
{
    "tableName": "your_table_name",
    "records": [
        {
            "column1": "value1",
            "column2": "value2"
        }
    ]
}
```

### GET /health
Health check endpoint.

## Running locally

1. Install dependencies:
```bash
npm install
```

2. Run the service:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## Running with Docker

1. Build the image:
```bash
docker build -t ingestion-service .
```

2. Run the container:
```bash
docker run -p 3000:3000 --env-file .env ingestion-service
