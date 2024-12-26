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

const generateInsertSQL = (tableName, records) => {
  const columns = Object.keys(records[0]);
  const placeholders = records.map((_, recordIndex) => 
    `(${columns.map((_, colIndex) => 
      `:param${recordIndex * columns.length + colIndex + 1}`
    ).join(', ')})`
  ).join(', ');
  
  const values = records.flatMap(record => 
    columns.map((col, index) => ({
      name: `param${index + 1}`,
      value: String(record[col])
    }))
  );
  
  return {
    sql: `INSERT INTO ${tableName}1 (${columns.join(', ')}) VALUES ${placeholders}`,
    values,
  };
};

const executeInsert = async (tableName, records) => {
  console.log('Executing Redshift query...');
  const { sql, values } = generateInsertSQL(tableName, records);
  
  try {
    const result = await redshiftClient.executeStatement({
      Database: process.env.REDSHIFT_DATABASE,
      SecretArn: process.env.REDSHIFT_SECRET_ARN,
      WorkgroupName: process.env.REDSHIFT_WORKGROUP_NAME,
      Sql: sql,
      Parameters: values
    });
    return result;
  } catch (error) {
    console.error('Redshift query error:', error.message);
    throw error;
  }
};

module.exports = { executeInsert };
