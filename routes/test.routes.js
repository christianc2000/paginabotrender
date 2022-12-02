const { Router } = require('express');
const { getTest } = require('../controllers/test.controller');
const router = Router();

router.post( '/', getTest );

module.exports = router;