const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getAll);
router.post('/', authenticate, authorize('admin'), create);
router.put('/:id', authenticate, authorize('admin'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);

module.exports = router;
