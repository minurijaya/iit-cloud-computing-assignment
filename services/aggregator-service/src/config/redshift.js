const { RedshiftData } = require('@aws-sdk/client-redshift-data');

const redshiftClient = new RedshiftData({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  maxAttempts: 3,
  timeout: 5000,
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const executeQuery = async (sql, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Executing query (attempt ${attempt}/${maxRetries})`);
      
      const result = await redshiftClient.executeStatement({
        Database: process.env.REDSHIFT_DATABASE,
        SecretArn: process.env.REDSHIFT_SECRET_ARN,
        WorkgroupName: process.env.REDSHIFT_WORKGROUP_NAME,
        Sql: sql
      });

      // Wait for query to complete
      let queryStatus;
      do {
        const statusResponse = await redshiftClient.describeStatement({
          Id: result.Id
        });
        queryStatus = statusResponse.Status;
        
        if (queryStatus === 'FAILED') {
          throw new Error(`Query failed: ${statusResponse.Error}`);
        }
        
        if (queryStatus === 'PICKED' || queryStatus === 'STARTED' || queryStatus === 'SUBMITTED') {
          await sleep(2000); // Wait 2 seconds before checking again
        }
      } while (queryStatus === 'PICKED' || queryStatus === 'STARTED' || queryStatus === 'SUBMITTED');

      console.log('Query completed successfully');
      return result;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      lastError = error;
      
      if (attempt < maxRetries) {
        const backoffTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`Retrying in ${backoffTime}ms...`);
        await sleep(backoffTime);
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
};

module.exports = { executeQuery };
