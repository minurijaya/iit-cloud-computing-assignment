const express = require('express');
const router = express.Router();
const Patient = require('../models/patient.model');
const { validatePatient } = require('../validators/patient.validator');
const IngestionClient = require('../../../shared/ingestion-client');

const ingestionClient = new IngestionClient();

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
    
    // Send to ingestion service
    try {
      await ingestionClient.ingestData('patients', {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        date_of_birth: patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.phone,
        created_at: patient.createdAt,
        updated_at: patient.updatedAt
      });
    } catch (ingestionError) {
      console.error('Error ingesting patient data:', ingestionError);
      // Continue with the response even if ingestion fails
    }
    
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
    
    const patient = await Patient.findByPk(req.params.id);
    
    // Send to ingestion service
    try {
      await ingestionClient.ingestData('patients', {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        date_of_birth: patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.phone,
        created_at: patient.createdAt,
        updated_at: patient.updatedAt
      });
    } catch (ingestionError) {
      console.error('Error ingesting updated patient data:', ingestionError);
      // Continue with the response even if ingestion fails
    }
    
    res.json(patient);
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
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    await Patient.destroy({
      where: { id: req.params.id }
    });

    // Send deletion event to ingestion service
    try {
      await ingestionClient.ingestData('patient_deletions', {
        id: patient.id,
        deleted_at: new Date().toISOString()
      });
    } catch (ingestionError) {
      console.error('Error ingesting patient deletion:', ingestionError);
      // Continue with the response even if ingestion fails
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Error deleting patient' });
  }
});

module.exports = router;
