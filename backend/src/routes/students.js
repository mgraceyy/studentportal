const express = require('express');
const router = express.Router();
const {
  getProfile, getGrades, getSchedule, changePassword,
  getEnrollmentStatus, getAvailableSubjects, getMyEnrollments, enrollSubject, dropSubject,
} = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('student'));

router.get('/me', getProfile);
router.get('/me/grades', getGrades);
router.get('/me/schedule', getSchedule);
router.put('/me/password', changePassword);

router.get('/enrollment-status', getEnrollmentStatus);
router.get('/subjects/available', getAvailableSubjects);
router.get('/me/enrollments', getMyEnrollments);
router.post('/me/enroll', enrollSubject);
router.delete('/me/enroll/:enrollmentId', dropSubject);

module.exports = router;
