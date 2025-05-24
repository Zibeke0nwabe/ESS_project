const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicantController');
const upload = require('../middleware/uploadMiddleware');

router.get('/', applicantController.showHomePage);
router.get('/register', applicantController.showRegisterForm);
router.post('/register',
  upload.fields([
    { name: 'idCopy', maxCount: 1 },
    { name: 'certificateCopy', maxCount: 1 },
    { name: 'parentID', maxCount: 1 }
  ]),
  applicantController.submitApplication
);
router.get('/login', applicantController.showLoginForm);
router.post('/login', applicantController.login);
router.get('/forgot-password', applicantController.showForgotPasswordPage);
router.post('/forgot-password', applicantController.sendOTP);
router.post('/verify-code', applicantController.verifyOTP);
router.post('/reset-password', applicantController.resetPassword);

module.exports = router;
