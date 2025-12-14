const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sets: {
    type: String,
    required: true,
  },
  reps: {
    type: String,
    required: true,
  },
});

const daySchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true,
  },
  dayName: {
    type: String,
    required: true,
  },
  exercises: [exerciseSchema],
  notes: {
    type: String,
    default: '',
  },
});

const workoutPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  days: [daySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);

