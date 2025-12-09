const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  submissionText: {
    type: String,
    default: ''
  },
  attachments: [{
    filename: String,
    url: String
  }],
  score: {
    type: Number,
    default: null
  },
  feedback: {
    type: String,
    default: ''
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'late'],
    default: 'submitted'
  }
}, {
  timestamps: true
});

// Prevent duplicate submissions (allow resubmission if not graded)
assignmentSubmissionSchema.index({ student: 1, assignment: 1 });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);

