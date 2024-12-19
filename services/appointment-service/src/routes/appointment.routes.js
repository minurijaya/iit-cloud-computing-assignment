const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment.model');
const { appointmentSchema, validateRequest } = require('../validators/appointment.validator');
const logger = require('../utils/logger');

// Create a new appointment
router.post('/', validateRequest(appointmentSchema.create), async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    logger.info('Appointment created successfully', { appointmentId: appointment.id });
    res.status(201).json({
      status: 'success',
      data: appointment
    });
  } catch (error) {
    logger.error('Error creating appointment', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Failed to create appointment'
    });
  }
});

// Get appointments by date range
router.get('/range', validateRequest(appointmentSchema.getByDateRange), async (req, res) => {
  try {
    const { startDate, endDate, doctorId, patientId } = req.query;
    const where = {
      appointmentDate: {
        [Op.between]: [startDate, endDate]
      }
    };

    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;

    const appointments = await Appointment.findAll({ where });
    res.json({
      status: 'success',
      data: appointments
    });
  } catch (error) {
    logger.error('Error fetching appointments', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch appointments'
    });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }
    res.json({
      status: 'success',
      data: appointment
    });
  } catch (error) {
    logger.error('Error fetching appointment', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch appointment'
    });
  }
});

// Update appointment
router.put('/:id', validateRequest(appointmentSchema.update), async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    await appointment.update(req.body);
    logger.info('Appointment updated successfully', { appointmentId: appointment.id });
    res.json({
      status: 'success',
      data: appointment
    });
  } catch (error) {
    logger.error('Error updating appointment', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Failed to update appointment'
    });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    await appointment.destroy();
    logger.info('Appointment deleted successfully', { appointmentId: req.params.id });
    res.json({
      status: 'success',
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting appointment', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete appointment'
    });
  }
});

module.exports = router;
