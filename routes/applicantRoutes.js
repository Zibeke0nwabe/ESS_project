const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicantController');

router.get('/', applicantController.showHomePage);
router.get('/register', applicantController.showRegisterForm);
router.post('/register', applicantController.submitApplication);
router.get('/login', applicantController.showLoginForm);
router.post('/login', applicantController.login);
router.get('/forgot-password', applicantController.showForgotPasswordPage);
router.post('/forgot-password', applicantController.sendOTP);
router.post('/verify-code', applicantController.verifyOTP);
router.post('/reset-password', applicantController.resetPassword);

module.exports = router;
