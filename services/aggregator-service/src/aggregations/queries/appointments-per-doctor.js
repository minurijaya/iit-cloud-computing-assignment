/**
 * Aggregates the number of appointments per doctor per day
 * Output table: doctor_daily_appointments
 * Schedule: Daily at 1 AM
 * Period: Previous day's data
 */

const query = `
  BEGIN TRANSACTION;

  -- Delete existing records for yesterday
  DELETE FROM doctor_daily_appointments 
  WHERE date = CURRENT_DATE - 1;

  -- Insert new records
  INSERT INTO doctor_daily_appointments (
    date,
    doctor_id,
    appointment_count,
    created_at
  )
  SELECT 
    DATE(appointment_datetime) as date,
    doctor_id,
    COUNT(*) as appointment_count,
    GETDATE() as created_at
  FROM appointments
  WHERE DATE(appointment_datetime) = CURRENT_DATE - 1
  GROUP BY DATE(appointment_datetime), doctor_id;

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
