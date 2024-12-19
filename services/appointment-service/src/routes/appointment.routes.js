const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment.model');
const { validateAppointment } = require('../validators/appointment.validator');
const { Op } = require('sequelize');

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.findAll();
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Error fetching appointments' });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Error fetching appointment' });
  }
});

// Get appointments by date range and optional doctor/patient ID
router.get('/search/date', async (req, res) => {
  try {
    const { startDate, endDate, doctorId, patientId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const where = {
      appointmentDate: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };

    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;

    const appointments = await Appointment.findAll({ where });
    res.json(appointments);
  } catch (error) {
    console.error('Error searching appointments:', error);
    res.status(500).json({ error: 'Error searching appointments' });
  }
});

// Create new appointment
router.post('/', validateAppointment, async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'This time slot is already booked' });
    } else {
      res.status(500).json({ error: 'Error creating appointment' });
    }
  }
});

// Update appointment
router.put('/:id', validateAppointment, async (req, res) => {
  try {
    const [updated] = await Appointment.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    const updatedAppointment = await Appointment.findByPk(req.params.id);
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'This time slot is already booked' });
    } else {
      res.status(500).json({ error: 'Error updating appointment' });
    }
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Appointment.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Error deleting appointment' });
  }
});

module.exports = router;