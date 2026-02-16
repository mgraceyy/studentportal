const express = require('express');
const router = express.Router();
const {
  getAllStudents, addStudent, updateStudent, deactivateStudent,
  updateGrades, updateSchedule,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.get('/students', getAllStudents);
router.post('/students', addStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deactivateStudent);
router.put('/grades/:studentId', updateGrades);
router.put('/schedules/:studentId', updateSchedule);

module.exports = router;
