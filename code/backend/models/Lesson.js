const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0 // in minutes
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lesson', lessonSchema);

