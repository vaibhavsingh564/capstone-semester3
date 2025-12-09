const express = require('express');
const { body, validationResult } = require('express-validator');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Performance = require('../models/Performance');
const { auth, authorize } = require('../middleware/auth');
const { buildQuery, buildSort, buildPagination, buildResponse } = require('../utils/queryBuilder');

const router = express.Router();

// @route   GET /api/assignments/course/:courseId
// @desc    Get all assignments for a course with filtering, pagination, sorting, searching
// @access  Public (for published), Private (for all if instructor)
// @query   page, limit, sortBy, sortOrder, search, isPublished, minPoints, maxPoints, dueDateBefore, dueDateAfter
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const isInstructor = req.user && (
      course.instructor.toString() === req.user._id.toString() || 
      req.user.role === 'admin'
    );

    const {
      page = 1,
      limit = 10,
      sortBy = 'dueDate',
      sortOrder = 'asc',
      search = '',
      isPublished = isInstructor ? 'all' : 'true',
      minPoints = '',
      maxPoints = '',
      dueDateBefore = '',
      dueDateAfter = ''
    } = req.query;

    let query = { course: req.params.courseId };

    if (!isInstructor || isPublished !== 'all') {
      query.isPublished = isPublished === 'true';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPoints || maxPoints) {
      query.maxPoints = {};
      if (minPoints) query.maxPoints.$gte = Number(minPoints);
      if (maxPoints) query.maxPoints.$lte = Number(maxPoints);
    }

    if (dueDateBefore || dueDateAfter) {
      query.dueDate = {};
      if (dueDateAfter) query.dueDate.$gte = new Date(dueDateAfter);
      if (dueDateBefore) query.dueDate.$lte = new Date(dueDateBefore);
    }

    const sort = buildSort(sortBy, sortOrder);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [assignments, total] = await Promise.all([
      Assignment.find(query).sort(sort).skip(skip).limit(limitNum),
      Assignment.countDocuments(query)
    ]);

    res.json(buildResponse(assignments, {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      hasNext: pageNum * limitNum < total,
      hasPrev: pageNum > 1
    }, { search, isPublished, minPoints, maxPoints, dueDateBefore, dueDateAfter }, { sortBy, sortOrder }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/assignments/:id
// @desc    Get single assignment
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('course', 'title instructor');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const course = await Course.findById(assignment.course._id);
    const isInstructor = course.instructor.toString() === req.user._id.toString() || req.user.role === 'admin';
    const isEnrolled = await Enrollment.findOne({ student: req.user._id, course: assignment.course._id });

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    res.json({ success: true, data: assignment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/assignments
// @desc    Create a new assignment
// @access  Private (Instructor)
router.post('/', [
  auth,
  authorize('instructor', 'admin'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('course').notEmpty().withMessage('Course ID is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('maxPoints').isNumeric().withMessage('Max points must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const assignment = await Assignment.create(req.body);
    const populatedAssignment = await Assignment.findById(assignment._id).populate('course', 'title instructor');

    res.status(201).json({ success: true, data: populatedAssignment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update an assignment
// @access  Private (Instructor)
router.put('/:id', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('course');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const course = await Course.findById(assignment.course._id);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(assignment, req.body);
    await assignment.save();

    const populatedAssignment = await Assignment.findById(assignment._id).populate('course', 'title instructor');
    res.json({ success: true, data: populatedAssignment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete an assignment
// @access  Private (Instructor)
router.delete('/:id', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('course');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const course = await Course.findById(assignment.course._id);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await AssignmentSubmission.deleteMany({ assignment: req.params.id });
    await assignment.deleteOne();

    res.json({ success: true, message: 'Assignment deleted', data: { id: req.params.id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/assignments/:id/submit
// @desc    Submit assignment
// @access  Private (Student)
router.post('/:id/submit', [
  auth,
  body('submissionText').optional(),
  body('attachments').optional().isArray()
], async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (!assignment.isPublished) {
      return res.status(400).json({ message: 'Assignment is not published' });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: assignment.course
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    const isLate = new Date() > new Date(assignment.dueDate);
    const status = isLate ? 'late' : 'submitted';

    const submission = await AssignmentSubmission.findOneAndUpdate(
      { student: req.user._id, assignment: req.params.id },
      {
        student: req.user._id,
        assignment: req.params.id,
        course: assignment.course,
        submissionText: req.body.submissionText || '',
        attachments: req.body.attachments || [],
        status,
        submittedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/:id/submissions
// @desc    Get all submissions for an assignment (Instructor only)
// @access  Private (Instructor)
router.get('/:id/submissions', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('course');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const course = await Course.findById(assignment.course._id);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const submissions = await AssignmentSubmission.find({ assignment: req.params.id })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    res.json({ success: true, data: submissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/assignments/:id/grade
// @desc    Grade an assignment submission
// @access  Private (Instructor)
router.put('/:id/grade', [
  auth,
  authorize('instructor', 'admin'),
  body('submissionId').notEmpty().withMessage('Submission ID is required'),
  body('score').isNumeric().withMessage('Score must be a number'),
  body('feedback').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const assignment = await Assignment.findById(req.params.id).populate('course');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const course = await Course.findById(assignment.course._id);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const submission = await AssignmentSubmission.findById(req.body.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.score = Math.min(req.body.score, assignment.maxPoints);
    submission.feedback = req.body.feedback || '';
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();
    submission.status = 'graded';
    await submission.save();

    // Update performance
    const enrollment = await Enrollment.findOne({
      student: submission.student,
      course: assignment.course
    });
    if (enrollment) {
      const Performance = require('../models/Performance');
      await updatePerformance(submission.student, assignment.course, enrollment._id);
    }

    res.json({ success: true, data: submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function
async function updatePerformance(studentId, courseId, enrollmentId) {
  try {
    const QuizSubmission = require('../models/QuizSubmission');
    const TestSubmission = require('../models/TestSubmission');
    const Quiz = require('../models/Quiz');
    const Test = require('../models/Test');
    const Assignment = require('../models/Assignment');
    const Performance = require('../models/Performance');

    const quizSubmissions = await QuizSubmission.find({ student: studentId, course: courseId });
    const testSubmissions = await TestSubmission.find({ student: studentId, course: courseId });
    const assignmentSubmissions = await AssignmentSubmission.find({ student: studentId, course: courseId });

    const quizScores = quizSubmissions.map(sub => ({
      quiz: sub.quiz,
      score: sub.score,
      percentage: sub.percentage,
      passed: sub.passed,
      submittedAt: sub.submittedAt
    }));

    const testScores = testSubmissions.map(sub => ({
      test: sub.test,
      score: sub.score,
      percentage: sub.percentage,
      passed: sub.passed,
      submittedAt: sub.submittedAt
    }));

    const assignmentScores = await Promise.all(assignmentSubmissions.map(async (sub) => {
      const assignment = await Assignment.findById(sub.assignment);
      return {
        assignment: sub.assignment,
        score: sub.score || 0,
        maxPoints: assignment?.maxPoints || 100,
        percentage: sub.score ? Math.round((sub.score / (assignment?.maxPoints || 100)) * 100) : 0,
        submittedAt: sub.submittedAt,
        gradedAt: sub.gradedAt
      };
    }));

    const allScores = [
      ...quizScores.map(s => s.percentage),
      ...testScores.map(s => s.percentage),
      ...assignmentScores.map(s => s.percentage)
    ].filter(s => s > 0);

    const overallGrade = allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

    await Performance.findOneAndUpdate(
      { student: studentId, course: courseId },
      {
        student: studentId,
        course: courseId,
        enrollment: enrollmentId,
        quizScores,
        testScores,
        assignmentScores,
        overallGrade,
        totalQuizzes: await Quiz.countDocuments({ course: courseId, isPublished: true }),
        totalTests: await Test.countDocuments({ course: courseId, isPublished: true }),
        totalAssignments: await Assignment.countDocuments({ course: courseId, isPublished: true }),
        completedQuizzes: quizScores.length,
        completedTests: testScores.length,
        completedAssignments: assignmentScores.length,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error updating performance:', error);
  }
}

module.exports = router;

