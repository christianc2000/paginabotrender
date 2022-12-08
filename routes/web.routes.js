const { Router } = require('express');
const { pusherando, test, getWebHook, postWebHook } = require('../controllers/chat.controller');

const router = Router();

// ===__********** Rutas  **********__===
router.get('/', test );
router.get('/webhook', getWebHook );
router.post('/webhook', postWebHook );

module.exports = router;