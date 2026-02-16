const express = require('express');
const router = express.Router();
const { getProfile, getGrades, getSchedule } = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('student'));

router.get('/me', getProfile);
router.get('/me/grades', getGrades);
router.get('/me/schedule', getSchedule);

module.exports = router;
