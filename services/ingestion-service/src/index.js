import { Kafka } from 'kafkajs';

class IngestionService {
    constructor() {
        this.kafka = new Kafka({
            clientId: 'cdc-consumer',
            brokers: ['my-cluster-kafka-bootstrap:9092']
        });

        this.consumer = this.kafka.consumer({
            groupId: 'cdc-consumer-group'
        });
    }

    async connect() {
        try {
            await this.consumer.connect();
            console.log('Connected to Kafka');

            // Subscribe to topics
            await this.consumer.subscribe({ 
                topics: ['dbserver1.mydb.doctors', 'dbserver1.mydb.patients'],
                fromBeginning: true 
            });

        } catch (error) {
            console.error('Error connecting to Kafka:', error);
            throw error;
        }
    }

    async processMessage(topic, data) {
        try {
            const table = topic.split('.').pop();  // Extract table name from topic
            const operation = data.op;  // Debezium operation type
            const timestamp = new Date().toISOString();

            console.log('----------------------------------------');
            console.log(`[${timestamp}] CDC Event`);
            console.log(`Table: ${table}`);
            console.log(`Operation: ${this.getOperationType(operation)}`);
            
            // Log the relevant data based on operation type
            if (operation === 'c' || operation === 'r') {
                console.log('Data:', JSON.stringify(data.after, null, 2));
            } else if (operation === 'u') {
                console.log('Old Data:', JSON.stringify(data.before, null, 2));
                console.log('New Data:', JSON.stringify(data.after, null, 2));
            } else if (operation === 'd') {
                console.log('Deleted Data:', JSON.stringify(data.before, null, 2));
            }
            
            console.log('----------------------------------------');

            // TODO: Implement specific business logic based on the event
            // Examples:
            // - For doctors: Update search index, notify admin
            // - For patients: Update analytics, sync with external systems
            
        } catch (error) {
            console.error('Error processing message:', error);
            // Don't throw here to continue processing other messages
        }
    }

    getOperationType(op) {
        const operations = {
            'c': 'CREATE',
            'u': 'UPDATE',
            'd': 'DELETE',
            'r': 'READ'
        };
        return operations[op] || 'UNKNOWN';
    }

    async start() {
        try {
            await this.connect();
            console.log('Starting to consume CDC events...');

            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    try {
                        const data = JSON.parse(message.value.toString());
                        await this.processMessage(topic, data);
                    } catch (error) {
                        console.error('Error processing message:', error);
                    }
                }
            });

        } catch (error) {
            console.error('Error starting service:', error);
            
            // Cleanup
            await this.stop();
            
            // Retry after delay
            console.log('Retrying in 5 seconds...');
            setTimeout(() => this.start(), 5000);
        }
    }

    async stop() {
        try {
            await this.consumer.disconnect();
            console.log('Service stopped gracefully');
        } catch (error) {
            console.error('Error stopping service:', error);
        }
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Graceful shutdown...');
    await ingestionService.stop();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('Received SIGINT. Graceful shutdown...');
    await ingestionService.stop();
    process.exit(0);
});

// Start the service
const ingestionService = new IngestionService();
ingestionService.start();
