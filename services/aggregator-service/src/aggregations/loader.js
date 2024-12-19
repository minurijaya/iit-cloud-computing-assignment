const fs = require('fs').promises;
const path = require('path');

/**
 * Loads all aggregation queries from the queries directory
 * Only loads .js files that export enabled aggregations
 */
const loadAggregations = async () => {
  const queriesDir = path.join(__dirname, 'queries');
  
  try {
    const files = await fs.readdir(queriesDir);
    const jsFiles = files.filter(file => file.endsWith('.js'));
    
    const aggregations = [];
    
    for (const file of jsFiles) {
      try {
        const aggregation = require(path.join(queriesDir, file));
        
        // Skip disabled aggregations and template file
        if (!aggregation.enabled || file === 'example-template.js') {
          console.log(`Skipping disabled aggregation: ${file}`);
          continue;
        }
        
        // Validate required fields
        const required = ['name', 'description', 'query', 'timeout', 'priority'];
        const missing = required.filter(field => !aggregation[field]);
        
        if (missing.length > 0) {
          console.error(`Skipping ${file}: Missing required fields: ${missing.join(', ')}`);
          continue;
        }
        
        aggregations.push(aggregation);
      } catch (error) {
        console.error(`Error loading aggregation ${file}:`, error.message);
      }
    }
    
    // Sort by priority
    return aggregations.sort((a, b) => a.priority - b.priority);
  } catch (error) {
    console.error('Error loading aggregations:', error.message);
    throw error;
  }
};

module.exports = { loadAggregations };
