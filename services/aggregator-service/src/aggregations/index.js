const { executeQuery } = require('../config/redshift');
const { loadAggregations } = require('./loader');

// Validate environment variables
const validateEnvironment = () => {
  const required = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'REDSHIFT_DATABASE',
    'REDSHIFT_SECRET_ARN',
    'REDSHIFT_WORKGROUP_NAME'
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

const runAggregations = async () => {
  try {
    console.log('Starting daily aggregations...');
    console.log('Validating environment...');
    validateEnvironment();
    
    console.log('Loading aggregation queries...');
    const aggregations = await loadAggregations();
    console.log(`Loaded ${aggregations.length} aggregation(s)`);
    
    const startTime = Date.now();
    let successCount = 0;
    let failureCount = 0;
    
    for (const agg of aggregations) {
      const aggStartTime = Date.now();
      try {
        console.log(`\nRunning aggregation: ${agg.name}`);
        console.log(`Description: ${agg.description}`);
        
        // Execute with timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), agg.timeout * 1000);
        });
        
        await Promise.race([
          executeQuery(agg.query),
          timeoutPromise
        ]);
        
        const duration = (Date.now() - aggStartTime) / 1000;
        console.log(`✓ Completed aggregation: ${agg.name} (${duration.toFixed(2)}s)`);
        successCount++;
      } catch (error) {
        const duration = (Date.now() - aggStartTime) / 1000;
        console.error(`✗ Error running aggregation ${agg.name} (${duration.toFixed(2)}s):`, error.message);
        failureCount++;
        // Continue with other aggregations even if one fails
      }
    }
    
    const totalDuration = (Date.now() - startTime) / 1000;
    console.log('\nAggregation Summary:');
    console.log(`- Total time: ${totalDuration.toFixed(2)} seconds`);
    console.log(`- Successful: ${successCount}`);
    console.log(`- Failed: ${failureCount}`);
    
    if (failureCount > 0) {
      throw new Error(`${failureCount} aggregation(s) failed`);
    }
  } catch (error) {
    console.error('\nAggregation process failed:', error.message);
    throw error; // Re-throw to ensure non-zero exit code
  }
};

module.exports = { runAggregations };
