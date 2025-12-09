const express = require('express');
const { body, validationResult } = require('express-validator');
const Purchase = require('../models/Purchase');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/purchases
// @desc    Purchase a course
// @access  Private (Student)
router.post('/', [
  auth,
  body('courseId').notEmpty().withMessage('Course ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already purchased
    const existingPurchase = await Purchase.findOne({
      student: req.user._id,
      course: req.body.courseId
    });

    if (existingPurchase && existingPurchase.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Course already purchased' });
    }

    // If course is free, auto-complete purchase
    const paymentStatus = course.price === 0 ? 'completed' : 'pending';
    const paymentMethod = course.price === 0 ? 'free' : (req.body.paymentMethod || 'card');

    // In a real app, you would integrate with payment gateway here
    // For now, we'll simulate successful payment for demo purposes
    const purchase = await Purchase.create({
      student: req.user._id,
      course: req.body.courseId,
      amount: course.price,
      paymentMethod,
      paymentStatus: course.price === 0 ? 'completed' : 'pending',
      transactionId: course.price === 0 ? `FREE-${Date.now()}` : `TXN-${Date.now()}`
    });

    // If payment is completed, create enrollment
    if (purchase.paymentStatus === 'completed') {
      const existingEnrollment = await Enrollment.findOne({
        student: req.user._id,
        course: req.body.courseId
      });

      if (!existingEnrollment) {
        await Enrollment.create({
          student: req.user._id,
          course: req.body.courseId
        });

        course.enrolledStudents.push(req.user._id);
        await course.save();
      }
    }

    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate('course', 'title price instructor')
      .populate('student', 'name email');

    res.status(201).json(populatedPurchase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/purchases/:id/complete
// @desc    Complete a purchase (simulate payment completion)
// @access  Private (Student)
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    if (purchase.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (purchase.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Purchase already completed' });
    }

    purchase.paymentStatus = 'completed';
    await purchase.save();

    // Create enrollment if not exists
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: purchase.course
    });

    if (!existingEnrollment) {
      await Enrollment.create({
        student: req.user._id,
        course: purchase.course
      });

      const course = await Course.findById(purchase.course);
      course.enrolledStudents.push(req.user._id);
      await course.save();
    }

    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate('course', 'title price instructor')
      .populate('student', 'name email');

    res.json(populatedPurchase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/purchases/my-purchases
// @desc    Get student's purchases
// @access  Private (Student)
router.get('/my-purchases', auth, async (req, res) => {
  try {
    const purchases = await Purchase.find({ student: req.user._id })
      .populate('course', 'title price instructor image')
      .sort({ purchasedAt: -1 });

    res.json(purchases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/purchases/course/:courseId
// @desc    Check if course is purchased
// @access  Private
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findOne({
      student: req.user._id,
      course: req.params.courseId,
      paymentStatus: 'completed'
    });

    res.json({ purchased: !!purchase, purchase });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

