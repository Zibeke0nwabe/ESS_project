const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/admin', adminController.showAdminLogin);
router.post('/admin', adminController.handleAdminLogin);
router.post('/admin/decision', adminController.makeDecision);

module.exports = router;