const express = require('express');
const Performance = require('../models/Performance');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/performance/course/:courseId
// @desc    Get student's performance for a course
// @access  Private
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    const performance = await Performance.findOne({
      student: req.user._id,
      course: req.params.courseId
    })
    .populate('course', 'title instructor')
    .populate('quizScores.quiz', 'title totalPoints')
    .populate('testScores.test', 'title totalPoints')
    .populate('assignmentScores.assignment', 'title maxPoints');

    if (!performance) {
      return res.json({
        student: req.user._id,
        course: req.params.courseId,
        overallGrade: 0,
        totalQuizzes: 0,
        totalTests: 0,
        totalAssignments: 0,
        completedQuizzes: 0,
        completedTests: 0,
        completedAssignments: 0,
        quizScores: [],
        testScores: [],
        assignmentScores: []
      });
    }

    res.json(performance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/performance/my-performance
// @desc    Get all student's performance
// @access  Private (Student)
router.get('/my-performance', auth, async (req, res) => {
  try {
    const performances = await Performance.find({ student: req.user._id })
      .populate('course', 'title instructor image category')
      .sort({ lastUpdated: -1 });

    res.json(performances);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/performance/course/:courseId/students
// @desc    Get all students' performance for a course (Instructor)
// @access  Private (Instructor)
router.get('/course/:courseId/students', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const performances = await Performance.find({ course: req.params.courseId })
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort({ overallGrade: -1 });

    res.json(performances);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

