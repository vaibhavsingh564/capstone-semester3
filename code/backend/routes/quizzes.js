const express = require('express');
const { body, validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const Course = require('../models/Course');
const Performance = require('../models/Performance');
const Enrollment = require('../models/Enrollment');
const { auth, authorize } = require('../middleware/auth');
const { buildQuery, buildSort, buildPagination, buildResponse } = require('../utils/queryBuilder');

const router = express.Router();

// @route   GET /api/quizzes/course/:courseId
// @desc    Get all quizzes for a course with filtering, pagination, sorting, searching
// @access  Public (for published), Private (for all if instructor)
// @query   page, limit, sortBy, sortOrder, search, isPublished, minTimeLimit, maxTimeLimit
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
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
      isPublished = isInstructor ? 'all' : 'true',
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

    if (minTimeLimit || maxTimeLimit) {
      query.timeLimit = {};
      if (minTimeLimit) query.timeLimit.$gte = Number(minTimeLimit);
      if (maxTimeLimit) query.timeLimit.$lte = Number(maxTimeLimit);
    }

    const sort = buildSort(sortBy, sortOrder);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [quizzes, total] = await Promise.all([
      Quiz.find(query).sort(sort).skip(skip).limit(limitNum),
      Quiz.countDocuments(query)
    ]);

    res.json(buildResponse(quizzes, {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      hasNext: pageNum * limitNum < total,
      hasPrev: pageNum > 1
    }, { search, isPublished, minTimeLimit, maxTimeLimit }, { sortBy, sortOrder }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Get single quiz
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'title instructor');
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const course = await Course.findById(quiz.course._id);
    const isInstructor = course.instructor.toString() === req.user._id.toString() || req.user.role === 'admin';
    const isEnrolled = await Enrollment.findOne({ student: req.user._id, course: quiz.course._id });

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    res.json({ success: true, data: quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/quizzes
// @desc    Create a new quiz
// @access  Private (Instructor)
router.post('/', [
  auth,
  authorize('instructor', 'admin'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('course').notEmpty().withMessage('Course ID is required'),
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

    const quiz = await Quiz.create(req.body);
    const populatedQuiz = await Quiz.findById(quiz._id).populate('course', 'title instructor');

    res.status(201).json({ success: true, data: populatedQuiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/quizzes/:id
// @desc    Update a quiz
// @access  Private (Instructor)
router.put('/:id', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const course = await Course.findById(quiz.course._id);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(quiz, req.body);
    await quiz.save();

    const populatedQuiz = await Quiz.findById(quiz._id).populate('course', 'title instructor');
    res.json({ success: true, data: populatedQuiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/quizzes/:id
// @desc    Delete a quiz
// @access  Private (Instructor)
router.delete('/:id', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const course = await Course.findById(quiz.course._id);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await QuizSubmission.deleteMany({ quiz: req.params.id });
    await quiz.deleteOne();

    res.json({ success: true, message: 'Quiz deleted', data: { id: req.params.id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/quizzes/:id/submit
// @desc    Submit quiz answers
// @access  Private (Student)
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (!quiz.isPublished) {
      return res.status(400).json({ message: 'Quiz is not published' });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: quiz.course
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Check if already submitted
    const existingSubmission = await QuizSubmission.findOne({
      student: req.user._id,
      quiz: req.params.id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Quiz already submitted' });
    }

    const { answers, timeSpent } = req.body;
    let score = 0;
    let totalPoints = 0;

    const submissionAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      if (!question) return null;

      totalPoints += question.points || 1;
      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      const pointsEarned = isCorrect ? (question.points || 1) : 0;
      score += pointsEarned;

      return {
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        pointsEarned
      };
    }).filter(Boolean);

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const passed = percentage >= quiz.passingScore;

    const submission = await QuizSubmission.create({
      student: req.user._id,
      quiz: req.params.id,
      course: quiz.course,
      answers: submissionAnswers,
      score,
      percentage,
      passed,
      timeSpent: timeSpent || 0
    });

    // Update performance
    await updatePerformance(req.user._id, quiz.course, enrollment._id);

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/quizzes/:id/submission
// @desc    Get student's quiz submission
// @access  Private
router.get('/:id/submission', auth, async (req, res) => {
  try {
    const submission = await QuizSubmission.findOne({
      student: req.user._id,
      quiz: req.params.id
    }).populate('quiz', 'title totalPoints passingScore');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json({ success: true, data: submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update performance
async function updatePerformance(studentId, courseId, enrollmentId) {
  try {
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

    const assignmentScores = assignmentSubmissions.map(sub => ({
      assignment: sub.assignment,
      score: sub.score || 0,
      maxPoints: sub.assignment?.maxPoints || 100,
      percentage: sub.score ? Math.round((sub.score / (sub.assignment?.maxPoints || 100)) * 100) : 0,
      submittedAt: sub.submittedAt,
      gradedAt: sub.gradedAt
    }));

    // Calculate overall grade
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

const TestSubmission = require('../models/TestSubmission');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Test = require('../models/Test');
const Assignment = require('../models/Assignment');

module.exports = router;

