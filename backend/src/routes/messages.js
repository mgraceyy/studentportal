const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getMessages);
router.post('/', sendMessage);

module.exports = router;
