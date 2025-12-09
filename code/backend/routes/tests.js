const express = require('express');
const { body, validationResult } = require('express-validator');
const Test = require('../models/Test');
const TestSubmission = require('../models/TestSubmission');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Performance = require('../models/Performance');
const { auth, authorize } = require('../middleware/auth');
const { buildQuery, buildSort, buildPagination, buildResponse } = require('../utils/queryBuilder');

const router = express.Router();

// @route   GET /api/tests/course/:courseId
// @desc    Get all tests for a course with filtering, pagination, sorting, searching
// @access  Public (for published), Private (for all if instructor)
// @query   page, limit, sortBy, sortOrder, search, isPublished, startDateAfter, endDateBefore, minTimeLimit, maxTimeLimit
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
      sortBy = 'startDate',
      sortOrder = 'asc',
      search = '',
      isPublished = isInstructor ? 'all' : 'true',
      startDateAfter = '',
      endDateBefore = '',
      minTimeLimit = '',
      maxTimeLimit = ''
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

    if (startDateAfter || endDateBefore) {
      query.startDate = {};
      if (startDateAfter) query.startDate.$gte = new Date(startDateAfter);
      if (endDateBefore) query.endDate = { $lte: new Date(endDateBefore) };
    }

    if (minTimeLimit || maxTimeLimit) {
      query.timeLimit = {};
      if (minTimeLimit) query.timeLimit.$gte = Number(minTimeLimit);
      if (maxTimeLimit) query.timeLimit.$lte = Number(maxTimeLimit);
    }

    const sort = buildSort(sortBy, sortOrder);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [tests, total] = await Promise.all([
      Test.find(query).sort(sort).skip(skip).limit(limitNum),
      Test.countDocuments(query)
    ]);

    res.json(buildResponse(tests, {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      hasNext: pageNum * limitNum < total,
      hasPrev: pageNum > 1
    }, { search, isPublished, startDateAfter, endDateBefore, minTimeLimit, maxTimeLimit }, { sortBy, sortOrder }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/tests/:id
// @desc    Get single test
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate('course', 'title instructor');
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const course = await Course.findById(test.course._id);
    const isInstructor = course.instructor.toString() === req.user._id.toString() || req.user.role === 'admin';
    const isEnrolled = await Enrollment.findOne({ student: req.user._id, course: test.course._id });

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    res.json({ success: true, data: test });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tests
// @desc    Create a new test
// @access  Private (Instructor)
router.post('/', [
  auth,
  authorize('instructor', 'admin'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('course').notEmpty().withMessage('Course ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('questions').isArray().withMessage('Questions must be an array')
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

    const test = await Test.create(req.body);
    const populatedTest = await Test.findById(test._id).populate('course', 'title instructor');

    res.status(201).json({ success: true, data: populatedTest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tests/:id
// @desc    Update a test
// @access  Private (Instructor)
router.put('/:id', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate('course');
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const course = await Course.findById(test.course._id);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(test, req.body);
    await test.save();

    const populatedTest = await Test.findById(test._id).populate('course', 'title instructor');
    res.json({ success: true, data: populatedTest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tests/:id
// @desc    Delete a test
// @access  Private (Instructor)
router.delete('/:id', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate('course');
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const course = await Course.findById(test.course._id);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await TestSubmission.deleteMany({ test: req.params.id });
    await test.deleteOne();

    res.json({ success: true, message: 'Test deleted', data: { id: req.params.id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tests/:id/submit
// @desc    Submit test answers
// @access  Private (Student)
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    if (!test.isPublished) {
      return res.status(400).json({ message: 'Test is not published' });
    }

    const now = new Date();
    if (now < new Date(test.startDate) || now > new Date(test.endDate)) {
      return res.status(400).json({ message: 'Test is not available at this time' });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: test.course
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Check if already submitted
    const existingSubmission = await TestSubmission.findOne({
      student: req.user._id,
      test: req.params.id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Test already submitted' });
    }

    const { answers, timeSpent } = req.body;
    let score = 0;
    let totalPoints = 0;

    const submissionAnswers = await Promise.all(answers.map(async (answer, index) => {
      const question = test.questions[index];
      if (!question) return null;

      totalPoints += question.points || 1;
      let isCorrect = false;
      let pointsEarned = 0;

      if (question.questionType === 'multiple-choice' || question.questionType === 'true-false') {
        isCorrect = JSON.stringify(answer.answer) === JSON.stringify(question.correctAnswer);
      } else {
        // For short-answer and essay, manual grading needed
        isCorrect = false;
        pointsEarned = 0;
      }

      if (isCorrect) {
        pointsEarned = question.points || 1;
        score += pointsEarned;
      }

      return {
        questionIndex: index,
        answer: answer.answer,
        isCorrect,
        pointsEarned
      };
    }));

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const passed = percentage >= test.passingScore;

    const submission = await TestSubmission.create({
      student: req.user._id,
      test: req.params.id,
      course: test.course,
      answers: submissionAnswers.filter(Boolean),
      score,
      percentage,
      passed,
      timeSpent: timeSpent || 0,
      submittedAt: new Date()
    });

    // Update performance
    await updatePerformance(req.user._id, test.course, enrollment._id);

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tests/:id/submission
// @desc    Get student's test submission
// @access  Private
router.get('/:id/submission', auth, async (req, res) => {
  try {
    const submission = await TestSubmission.findOne({
      student: req.user._id,
      test: req.params.id
    }).populate('test', 'title totalPoints passingScore');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
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
    const AssignmentSubmission = require('../models/AssignmentSubmission');
    const Quiz = require('../models/Quiz');
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

