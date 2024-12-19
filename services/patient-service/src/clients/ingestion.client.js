const axios = require('axios');

class IngestionClient {
    constructor(baseURL = process.env.INGESTION_SERVICE_URL || 'http://ingestion-service:3000') {
        this.client = axios.create({
            baseURL,
            timeout: 5000
        });
    }

    async ingestData(tableName, records) {
        try {
            const response = await this.client.post('/ingest', {
                tableName,
                records: Array.isArray(records) ? records : [records]
            });
            return response.data;
        } catch (error) {
            console.error(`Error ingesting data to ${tableName}:`, error.message);
            throw error;
        }
    }
}

module.exports = IngestionClient;
