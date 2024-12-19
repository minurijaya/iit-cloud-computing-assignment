/**
 * Template for creating new aggregation queries
 * Copy this file and modify it for your new aggregation
 */

const query = `
  BEGIN TRANSACTION;

  -- Delete existing records for the time period you're calculating
  DELETE FROM your_target_table 
  WHERE date = CURRENT_DATE - 1;

  -- Insert new records
  INSERT INTO your_target_table (
    -- Specify your columns here
    column1,
    column2,
    created_at
  )
  SELECT 
    -- Your aggregation logic here
    field1,
    COUNT(*) as count,
    GETDATE() as created_at
  FROM your_source_table
  WHERE your_date_field = CURRENT_DATE - 1
  GROUP BY field1;

  COMMIT;
`;

module.exports = {
  name: 'example_aggregation', // Unique identifier for this aggregation
  description: 'Description of what this aggregation does',
  query,
  enabled: false, // Set to true to enable
  timeout: 300, // Timeout in seconds
  priority: 999 // Lower numbers run first
};
