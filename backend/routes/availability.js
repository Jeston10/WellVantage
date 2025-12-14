const express = require('express');
const Availability = require('../models/Availability');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all availability slots for a user
router.get('/', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const query = { userId: req.user._id };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const availability = await Availability.find(query).sort({ date: 1, startTime: 1 });
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability', error: error.message });
  }
});

// Create availability slot
router.post('/', auth, async (req, res) => {
  try {
    const { date, startTime, endTime, sessionName, repeatSessions } = req.body;

    if (!date || !startTime || !endTime || !sessionName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const availability = new Availability({
      userId: req.user._id,
      date: new Date(date),
      startTime,
      endTime,
      sessionName,
      repeatSessions: repeatSessions || false,
    });

    await availability.save();
    res.status(201).json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Error creating availability', error: error.message });
  }
});

// Update availability slot
router.put('/:id', auth, async (req, res) => {
  try {
    const { date, startTime, endTime, sessionName, repeatSessions } = req.body;

    const availability = await Availability.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        date: date ? new Date(date) : undefined,
        startTime,
        endTime,
        sessionName,
        repeatSessions,
      },
      { new: true }
    );

    if (!availability) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Error updating availability', error: error.message });
  }
});

// Delete availability slot
router.delete('/:id', auth, async (req, res) => {
  try {
    const availability = await Availability.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!availability) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }

    res.json({ message: 'Availability slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting availability', error: error.message });
  }
});

// Book a slot
router.post('/:id/book', auth, async (req, res) => {
  try {
    const availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }

    if (availability.isBooked) {
      return res.status(400).json({ message: 'Slot is already booked' });
    }

    availability.isBooked = true;
    availability.bookedBy = req.user._id;
    await availability.save();

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Error booking slot', error: error.message });
  }
});

module.exports = router;

