/**
 * Aggregates the age group of the patiens of doctors per day
 * Output table: specialty_appointment_reason
 * Schedule: Daily at 1 AM
 * Period: Previous day's data
 */

const date = new Date();
date.setDate(date.getDate() - 1); // Subtract 1 day from the current date to get the previous day's data
const yesterday = date.toISOString().split('T')[0];

console.log({yesterday});
const query = `
  BEGIN TRANSACTION;

  -- Insert new records
  INSERT INTO specialty_appointment_reason(specialty, appointment_reason, occurrence_count, appointment_datetime)
SELECT 
  d.specialty AS specialty,
  a.appointment_reason AS appointment_reason,
  COUNT(a.id) AS occurrence_count,  -- Count the occurrences of each condition
  a.appointment_datetime AS appointment_datetime
FROM appointments a
JOIN doctors d ON a.doctor_id = d.id
WHERE DATE(a.appointment_datetime) = '${yesterday}' -- Use DATE() to match the date portion only
GROUP BY 
  d.specialty, 
  a.appointment_reason,
  a.appointment_datetime
ORDER BY 
  d.specialty, 
  occurrence_count DESC;  -- Order by specialty and then by the frequency of conditions

  COMMIT;
`;

module.exports = {
  name: 'specialty_appointment_reason',
  description: 'specialty_appointment_reason for each doctor appointment',
  query,
  enabled: true, // Can be used to temporarily disable aggregations
  timeout: 300, // Timeout in seconds
  priority: 2 // Lower numbers run first
};
