const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const { auth, authorize } = require('../middleware/auth');
const { buildQuery, buildSort, buildPagination, buildResponse } = require('../utils/queryBuilder');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses with filtering, pagination, sorting, searching
// @access  Public
// @query   page, limit, sortBy, sortOrder, search, category, minPrice, maxPrice, isPublished
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
      category = '',
      minPrice = '',
      maxPrice = '',
      isPublished = 'true'
    } = req.query;

    // Build query with filtering and searching
    let query = {};
    
    // Published filter
    if (isPublished !== 'all') {
      query.isPublished = isPublished === 'true';
    }

    // Category filter
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search across title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = buildSort(sortBy, sortOrder);

    // Build pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('instructor', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Course.countDocuments(query)
    ]);

    res.json(buildResponse(courses, {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      hasNext: pageNum * limitNum < total,
      hasPrev: pageNum > 1
    }, { search, category, minPrice, maxPrice, isPublished }, { sortBy, sortOrder }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/courses/my-courses
// @desc    Get instructor's courses with filtering, pagination, sorting, searching
// @access  Private (Instructor)
// @query   page, limit, sortBy, sortOrder, search, category, isPublished
router.get('/my-courses', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
      category = '',
      isPublished = 'all'
    } = req.query;

    // Build query
    let query = { instructor: req.user._id };

    if (isPublished !== 'all') {
      query.isPublished = isPublished === 'true';
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = buildSort(sortBy, sortOrder);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('instructor', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Course.countDocuments(query)
    ]);

    res.json(buildResponse(courses, {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      hasNext: pageNum * limitNum < total,
      hasPrev: pageNum > 1
    }, { search, category, isPublished }, { sortBy, sortOrder }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/courses/enrolled
// @desc    Get student's enrolled courses with filtering, pagination, sorting, searching
// @access  Private (Student)
// @query   page, limit, sortBy, sortOrder, search, category, minProgress, maxProgress
router.get('/enrolled', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
      category = '',
      minProgress = '',
      maxProgress = ''
    } = req.query;

    let query = { student: req.user._id };

    // Progress range filter
    if (minProgress || maxProgress) {
      query.progress = {};
      if (minProgress) query.progress.$gte = Number(minProgress);
      if (maxProgress) query.progress.$lte = Number(maxProgress);
    }

    const sort = buildSort(sortBy, sortOrder);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let enrollments = await Enrollment.find(query)
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name email' },
        match: search || category ? {
          $or: search ? [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ] : [],
          ...(category ? { category: { $regex: category, $options: 'i' } } : {})
        } : {}
      })
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Filter out enrollments with null courses (from search)
    enrollments = enrollments.filter(e => e.course);

    const total = await Enrollment.countDocuments(query);

    res.json(buildResponse(enrollments, {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      hasNext: pageNum * limitNum < total,
      hasPrev: pageNum > 1
    }, { search, category, minProgress, maxProgress }, { sortBy, sortOrder }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lessons = await Lesson.find({ course: req.params.id }).sort({ order: 1 });
    
    res.json({ course, lessons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Instructor)
router.post('/', [
  auth,
  authorize('instructor', 'admin'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').trim().notEmpty().withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = await Course.create({
      ...req.body,
      instructor: req.user._id
    });

    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'name email');

    res.status(201).json({ success: true, data: populatedCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update a course
// @access  Private (Instructor/Owner)
router.put('/:id', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(course, req.body);
    await course.save();

    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'name email');

    res.json({ success: true, data: populatedCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete a course
// @access  Private (Instructor/Owner)
router.delete('/:id', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete associated lessons
    await Lesson.deleteMany({ course: req.params.id });
    
    // Delete associated enrollments
    await Enrollment.deleteMany({ course: req.params.id });

    await course.deleteOne();

    res.json({ success: true, message: 'Course deleted', data: { id: req.params.id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

