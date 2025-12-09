const express = require('express');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Purchase = require('../models/Purchase');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/enrollments
// @desc    Enroll in a course (free courses only, paid courses require purchase)
// @access  Private (Student)
router.post('/', auth, async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if course requires purchase
    if (course.price > 0) {
      const purchase = await Purchase.findOne({
        student: req.user._id,
        course: courseId,
        paymentStatus: 'completed'
      });

      if (!purchase) {
        return res.status(400).json({ 
          message: 'Course requires purchase. Please purchase the course first.',
          requiresPurchase: true
        });
      }
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId
    });

    // Add student to course's enrolledStudents array
    course.enrolledStudents.push(req.user._id);
    await course.save();

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name email' }
      })
      .populate('student', 'name email');

    res.status(201).json(populatedEnrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/enrollments/:id/progress
// @desc    Update enrollment progress
// @access  Private (Student)
router.put('/:id/progress', auth, async (req, res) => {
  try {
    const { lessonId } = req.body;

    const enrollment = await Enrollment.findById(req.params.id);
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Check if user owns this enrollment
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Add lesson to completed lessons if not already there
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    // Calculate progress
    const totalLessons = await Lesson.countDocuments({ course: enrollment.course });
    if (totalLessons > 0) {
      enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
    }

    await enrollment.save();

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name email' }
      })
      .populate('completedLessons');

    res.json(populatedEnrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/enrollments/:courseId
// @desc    Get enrollment for a course
// @access  Private
router.get('/:courseId', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId
    })
    .populate({
      path: 'course',
      populate: { path: 'instructor', select: 'name email' }
    })
    .populate('completedLessons');

    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    res.json(enrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

