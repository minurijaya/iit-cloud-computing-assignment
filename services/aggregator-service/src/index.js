require('dotenv').config();
const { runAggregations } = require('./aggregations');

const main = async () => {
  try {
    await runAggregations();
    process.exit(0);
  } catch (error) {
    console.error('Error running aggregations:', error);
    process.exit(1);
  }
};

main();
