const { Router } = require('express');
const router = Router();

router.use('/', require('./public'));

module.exports = router;