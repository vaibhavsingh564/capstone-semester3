const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  quizScores: [{
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    },
    score: Number,
    percentage: Number,
    passed: Boolean,
    submittedAt: Date
  }],
  testScores: [{
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test'
    },
    score: Number,
    percentage: Number,
    passed: Boolean,
    submittedAt: Date
  }],
  assignmentScores: [{
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment'
    },
    score: Number,
    maxPoints: Number,
    percentage: Number,
    submittedAt: Date,
    gradedAt: Date
  }],
  overallGrade: {
    type: Number,
    default: 0
  },
  totalQuizzes: {
    type: Number,
    default: 0
  },
  totalTests: {
    type: Number,
    default: 0
  },
  totalAssignments: {
    type: Number,
    default: 0
  },
  completedQuizzes: {
    type: Number,
    default: 0
  },
  completedTests: {
    type: Number,
    default: 0
  },
  completedAssignments: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for quick lookups
performanceSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Performance', performanceSchema);

