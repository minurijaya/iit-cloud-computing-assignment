/**
 * Aggregates the number of appointments per doctor per day
 * Output table:appointments_per_doctor
 * Schedule: Daily at 1 AM
 * Period: Previous day's data
 */
//comment
const date = new Date();
date.setDate(date.getDate() - 1); // Subtract 1 day from the current date to get the previous day's data
const yesterday = date.toISOString().split('T')[0];
//comment
const query = `
  BEGIN TRANSACTION;

  -- Insert new records
  INSERT INTO appointments_per_doctor (doctor_name, appointments_count, appointment_datetime)
SELECT 
    (d.first_name || ' ' || d.last_name) AS doctor_name,  -- Concatenate first and last names
    COUNT(a.id) AS number_of_appointments,
    a.appointment_datetime  -- Include appointment_datetime
FROM appointments a
JOIN doctors d ON a.doctor_id = d.id
WHERE DATE(a.appointment_datetime) = '2024-12-27'  -- Compare only the date part
GROUP BY 
    (d.first_name || ' ' || d.last_name), 
    a.appointment_datetime  -- Group by doctor_name and appointment_datetime
ORDER BY 
    number_of_appointments DESC;  -- Optional: order by number of appointments (highest first)

  COMMIT;
`;

module.exports = {
  name: 'appointments_per_doctor',
  description: 'Calculate daily appointment counts for each doctor',
  query,
  enabled: true, // Can be used to temporarily disable aggregations
  timeout: 300, // Timeout in seconds
  priority: 1 // Lower numbers run first
};
