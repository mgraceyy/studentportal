const express = require('express');
const router = express.Router();
const { getConversations, getThread, sendMessage, searchUsers, getUnreadCount } = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getConversations);
router.get('/unread-count', getUnreadCount);
router.get('/search-users', searchUsers);
router.get('/:partnerId', getThread);
router.post('/', sendMessage);

module.exports = router;
