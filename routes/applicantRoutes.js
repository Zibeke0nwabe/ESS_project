const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicantController');

router.get('/', applicantController.showHomePage);
router.get('/register', applicantController.showRegisterForm);
router.post('/register', applicantController.submitApplication);
router.get('/login', applicantController.showLoginForm);
router.post('/login', applicantController.login);

module.exports = router;
