const express = require('express');
const Client = require('../models/Client');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all clients for a trainer
router.get('/', auth, async (req, res) => {
  try {
    const clients = await Client.find({ trainerId: req.user._id }).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients', error: error.message });
  }
});

// Get a specific client
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      trainerId: req.user._id,
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client', error: error.message });
  }
});

// Create a new client
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, phone, sessionsRemaining, sessionsExpiryDate } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Client name is required' });
    }

    const client = new Client({
      trainerId: req.user._id,
      name,
      email,
      phone,
      sessionsRemaining: sessionsRemaining || 0,
      sessionsExpiryDate: sessionsExpiryDate ? new Date(sessionsExpiryDate) : undefined,
    });

    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error creating client', error: error.message });
  }
});

// Update a client
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, phone, sessionsRemaining, sessionsExpiryDate } = req.body;

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, trainerId: req.user._id },
      {
        name,
        email,
        phone,
        sessionsRemaining,
        sessionsExpiryDate: sessionsExpiryDate ? new Date(sessionsExpiryDate) : undefined,
      },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error updating client', error: error.message });
  }
});

// Delete a client
router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      trainerId: req.user._id,
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting client', error: error.message });
  }
});

module.exports = router;

