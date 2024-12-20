/**
 * Aggregates the age group of the patiens of doctors per day
 * Output table: doctor_age_distribution
 * Schedule: Daily at 1 AM
 * Period: Previous day's data
 */

const date = new Date();
date.setDate(date.getDate() - 1); // Subtract 1 day from the current date to get the previous day's data
const yesterday = date.toISOString().split('T')[0];


const query = `
  BEGIN TRANSACTION;

  -- Insert new records
  INSERT INTO doctor_age_distribution (doctor_name, age_range, patient_count,appointment_datetime)
  SELECT 
   (d.first_name || ' ' || d.last_name) AS doctor_name,
  CASE
    WHEN DATE_PART('year', CURRENT_DATE) - DATE_PART('year', p.date_of_birth) BETWEEN 0 AND 18 THEN '0-18'
    WHEN DATE_PART('year', CURRENT_DATE) - DATE_PART('year', p.date_of_birth) BETWEEN 19 AND 40 THEN '19-40'
    WHEN DATE_PART('year', CURRENT_DATE) - DATE_PART('year', p.date_of_birth) BETWEEN 41 AND 60 THEN '41-60'
    WHEN DATE_PART('year', CURRENT_DATE) - DATE_PART('year', p.date_of_birth) > 60 THEN '60+'
  END AS age_range,
  COUNT(p.id) AS patient_count,
  a.appointment_datetime
FROM appointments a
JOIN doctors d ON a.doctor_id = d.id
JOIN patients p ON a.patient_id = p.id
WHERE DATE(a.appointment_datetime) = '${yesterday}'  -- Filter by date only
GROUP BY 
   (d.first_name || ' ' || d.last_name),
   d.id, 
   a.appointment_datetime,
   age_range
ORDER BY 
  doctor_name, 
  age_range ASC;

  COMMIT;
`;

module.exports = {
  name: 'doctor_age_distribution',
  description: 'Calculate daily doctor_age_distributionfor each doctor',
  query,
  enabled: true, // Can be used to temporarily disable aggregations
  timeout: 300, // Timeout in seconds
  priority: 2 // Lower numbers run first
};
