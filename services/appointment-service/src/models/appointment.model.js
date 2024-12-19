const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'patient_id',
    references:{
      model: 'patients',
      key: 'id'
    }
 },
  doctorId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'doctor_id',
    references:{
      model: 'Doctors',
      key: 'id'
    }
  },
  appointmentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'appointment_date' 
  },
  appointmentTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'appointment_time' 
  },
  appointmentReason: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'appointment_reason'
  },
  
}, {
  tableName: 'appointments',
  timestamps: true,
  underscored: true
});

module.exports = Appointment;
