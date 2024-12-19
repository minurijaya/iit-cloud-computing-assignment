const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'patient_id',
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'doctor_id',
    references: {
      model: 'Doctors',
      key: 'id'
    }
  },
  appointmentDateTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'appointment_datetime',
    validate: {
      isDate: true,
      isFuture(value) {
        if (value < new Date()) {
          throw new Error('Appointment date must be in the future');
        }
      }
    }
  },
  appointmentReason: {
    type: DataTypes.STRING(1000),
    allowNull: false,
    field: 'appointment_reason',
    validate: {
      notEmpty: true,
      len: [3, 1000]
    }
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'scheduled',
    field: 'status'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'notes'
  }
}, {
  tableName: 'appointments',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['appointment_datetime', 'doctor_id'],
      name: 'appointment_datetime_doctor_idx'
    },
    {
      fields: ['appointment_datetime', 'patient_id'],
      name: 'appointment_datetime_patient_idx'
    }
  ]
});

module.exports = Appointment;
