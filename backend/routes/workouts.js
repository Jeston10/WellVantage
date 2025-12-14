const express = require('express');
const WorkoutPlan = require('../models/WorkoutPlan');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all workout plans for a user
router.get('/', auth, async (req, res) => {
  try {
    const workoutPlans = await WorkoutPlan.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(workoutPlans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workout plans', error: error.message });
  }
});

// Get a specific workout plan
router.get('/:id', auth, async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    res.json(workoutPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workout plan', error: error.message });
  }
});

// Create a new workout plan
router.post('/', auth, async (req, res) => {
  try {
    const { name, days } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Workout plan name is required' });
    }

    const workoutPlan = new WorkoutPlan({
      name,
      userId: req.user._id,
      days: days || [],
    });

    await workoutPlan.save();
    res.status(201).json(workoutPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error creating workout plan', error: error.message });
  }
});

// Update a workout plan
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, days } = req.body;

    const workoutPlan = await WorkoutPlan.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        name,
        days,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    res.json(workoutPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error updating workout plan', error: error.message });
  }
});

// Delete a workout plan
router.delete('/:id', auth, async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    res.json({ message: 'Workout plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting workout plan', error: error.message });
  }
});

module.exports = router;

