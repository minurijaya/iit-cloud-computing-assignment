const express = require('express');
const router = express.Router();
const Patient = require('../models/patient.model');
const { validatePatient } = require('../validators/patient.validator');

// Get all patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.findAll();
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Error fetching patients' });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Error fetching patient' });
  }
});

// Create new patient
router.post('/', validatePatient, async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (error) {
    console.error('Error creating patient:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Error creating patient' });
    }
  }
});

// Update patient
router.put('/:id', validatePatient, async (req, res) => {
  try {
    const [updated] = await Patient.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const updatedPatient = await Patient.findByPk(req.params.id);
    res.json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Error updating patient' });
    }
  }
});

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Patient.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Error deleting patient' });
  }
});

module.exports = router;
