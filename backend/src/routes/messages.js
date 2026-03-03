const express = require('express');
const router = express.Router();
const { getConversations, getThread, sendMessage } = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getConversations);
router.get('/:partnerId', getThread);
router.post('/', sendMessage);

module.exports = router;
