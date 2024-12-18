const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctor.model');
const { validateDoctor } = require('../validators/doctor.validator');

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.findAll();
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Error fetching doctors' });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Error fetching doctor' });
  }
});

// Create new doctor
router.post('/', validateDoctor, async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (error) {
    console.error('Error creating doctor:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Error creating doctor' });
    }
  }
});

// Update doctor
router.put('/:id', validateDoctor, async (req, res) => {
  try {
    const [updated] = await Doctor.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    const updatedDoctor = await Doctor.findByPk(req.params.id);
    res.json(updatedDoctor);
  } catch (error) {
    console.error('Error updating doctor:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Error updating doctor' });
    }
  }
});

// Delete doctor
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Doctor.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ error: 'Error deleting doctor' });
  }
});

module.exports = router;
