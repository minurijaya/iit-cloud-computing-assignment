const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctor.model');
const { validateDoctor } = require('../validators/doctor.validator');
const IngestionClient = require('../clients/ingestion.client');

const ingestionClient = new IngestionClient();

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
    
    // Send to ingestion service
    try {
      await ingestionClient.ingestData('doctors', {
        id: doctor.id,
        first_name: doctor.firstName,
        last_name: doctor.lastName,
        gender: doctor.gender,
        specialty: doctor.specialty,
        email: doctor.email,
        created_at: doctor.createdAt,
        updated_at: doctor.updatedAt
      });
    } catch (ingestionError) {
      console.error('Error ingesting doctor data:', ingestionError);
      // Continue with the response even if ingestion fails
    }
    
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
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    await doctor.update(req.body);

    // Send to ingestion service
    try {
      await ingestionClient.ingestData('doctors', {
        id: doctor.id,
        first_name: doctor.firstName,
        last_name: doctor.lastName,
        gender: doctor.gender,
        specialty: doctor.specialty,
        email: doctor.email,
        created_at: doctor.createdAt,
        updated_at: doctor.updatedAt
      });
    } catch (ingestionError) {
      console.error('Error ingesting updated doctor data:', ingestionError);
      // Continue with the response even if ingestion fails
    }

    res.json(doctor);
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Error updating doctor' });
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
