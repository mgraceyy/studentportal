const express = require('express');
const router = express.Router();
const {
  getAllStudents, addStudent, updateStudent, deactivateStudent,
  getAllGrades, addGrade, updateGrade, deleteGrade,
  getSchedules, addSchedule, deleteSchedule,
  getAllSubjects, addSubject, updateSubject, deleteSubject,
  getEnrollments,
  getProspectus, addProspectus, deleteProspectus,
  getEnrollmentSettings, updateEnrollmentSettings,
  getProfile, updateProfile, changePassword,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.get('/students', getAllStudents);
router.post('/students', addStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deactivateStudent);
router.get('/grades', getAllGrades);
router.post('/grades', addGrade);
router.put('/grades/:id', updateGrade);
router.delete('/grades/:id', deleteGrade);
router.get('/schedules', getSchedules);
router.post('/schedules', addSchedule);
router.delete('/schedules/:id', deleteSchedule);

router.get('/subjects', getAllSubjects);
router.post('/subjects', addSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

router.get('/enrollments', getEnrollments);

router.get('/prospectus', getProspectus);
router.post('/prospectus', addProspectus);
router.delete('/prospectus/:id', deleteProspectus);

router.get('/enrollment-settings', getEnrollmentSettings);
router.put('/enrollment-settings', updateEnrollmentSettings);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/password', changePassword);

module.exports = router;
