const express = require('express');
const router = express.Router();
const {
  getAllStudents, addStudent, updateStudent, deactivateStudent,
  updateGrades, updateSchedule,
  getAllSubjects, addSubject, updateSubject, deleteSubject,
  getEnrollments,
  getEnrollmentSettings, updateEnrollmentSettings,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.get('/students', getAllStudents);
router.post('/students', addStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deactivateStudent);
router.put('/grades/:studentId', updateGrades);
router.put('/schedules/:studentId', updateSchedule);

router.get('/subjects', getAllSubjects);
router.post('/subjects', addSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

router.get('/enrollments', getEnrollments);

router.get('/enrollment-settings', getEnrollmentSettings);
router.put('/enrollment-settings', updateEnrollmentSettings);

module.exports = router;
