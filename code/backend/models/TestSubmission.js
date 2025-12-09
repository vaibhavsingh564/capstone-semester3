const mongoose = require('mongoose');

const testAnswerSchema = new mongoose.Schema({
  questionIndex: Number,
  answer: mongoose.Schema.Types.Mixed,
  isCorrect: Boolean,
  pointsEarned: Number
});

const testSubmissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  answers: [testAnswerSchema],
  score: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Prevent duplicate submissions
testSubmissionSchema.index({ student: 1, test: 1 }, { unique: true });

module.exports = mongoose.model('TestSubmission', testSubmissionSchema);

