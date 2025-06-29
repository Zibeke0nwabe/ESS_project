const Applicant = require('../models/Applicant');
const transporter = require('../config/email');
const path = require('path');

function generateStudentNumber() {
    const prefix = '25';
    const digits = '0123456789';
    let studentNumber = prefix;
    for (let i = 0; i < 6; i++) {
        studentNumber += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return studentNumber;
}

exports.showHomePage = (req, res) => {
    res.render('index');
};

exports.showRegisterForm = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/form.html'));
};

exports.submitApplication = async (req, res) => {
    const {
        title, name, surname, password, idNumber, DOB, marital, language, gender, mobile, altmobile, email,
        province, town, Suburb, addressCode, education, eduYear, school,
        mathsLevel, scienceLevel, accountingLevel, geographyLevel, lifeScienceLevel, businessStudiesLevel,
        economicsLevel, agriculturalScienceLevel, selectedSubjects
    } = req.body;

    const idCopy = req.files['idCopy'] ? req.files['idCopy'][0].filename : null;
    const certificateCopy = req.files['certificateCopy'] ? req.files['certificateCopy'][0].filename : null;
    const parentID = req.files['parentID'] ? req.files['parentID'][0].filename : null;

    try {
        const studentNumber = generateStudentNumber();

        const applicant = new Applicant({
            title, name, surname, password, studentNumber, idNumber, DOB, marital, language, gender, mobile, altmobile, email,
            province, town, Suburb, addressCode, education, eduYear, school,
            idCopy, certificateCopy, parentID,
            mathsLevel, scienceLevel, accountingLevel, geographyLevel, lifeScienceLevel, businessStudiesLevel,
            economicsLevel, agriculturalScienceLevel,
            selectedSubjects: Array.isArray(selectedSubjects) ? selectedSubjects : [selectedSubjects]
        });

        await applicant.save();


        await transporter.sendMail({
            from: `"Ekhaya Smart Scholars Admissions" <${process.env.EMAIL_USER}>`,
            to: applicant.email,
            subject: 'Application Confirmation - Submitted Successfully',
            html: `
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); font-family: Arial, sans-serif; color: #000026;">
              <p style="margin-bottom: 10px;">Dear ${applicant.name} ${applicant.surname},</p>

              <h2 style="color: #000026; font-size: 24px;">🎉 Welcome to Ekhaya Smart Scholars!</h2>

              <p style="font-size: 16px; line-height: 1.6;">
                Thank you for submitting your application to <strong>Ekhaya Smart Scholars</strong>. We're thrilled to see your interest in joining our academic community!
              </p>

              <p style="font-size: 16px; line-height: 1.6;">
                We've successfully received your application, and it is now under review by our admissions team.
              </p>

              <h3 style="color: #000026; font-size: 18px; margin-top: 20px;">📋 Your Application Details:</h3>
              <ul style="font-size: 16px; line-height: 1.8; color: #000026; padding-left: 20px;">
                <li><strong>Full Name:</strong> ${applicant.name} ${applicant.surname}</li>
                <li><strong>Student Number:</strong> ${applicant.studentNumber}</li>
                <li><strong>Login Password:</strong> ${applicant.password}</li>
              </ul>

              <div style="background-color: #000026; padding: 14px 20px; margin: 20px 0; border-radius: 8px; color: #FF4136; font-weight: bold; text-align: center;">
                ⚠️ Please keep your Student Number and Password safe — you'll need them to log in and track your application or manage your account.
              </div>

              <p style="font-size: 16px; line-height: 1.6;">
                ✅ You will receive a follow-up email once your application has been reviewed and a decision has been made.
              </p>

              <p style="font-size: 16px; line-height: 1.6;">
                You can check your application status anytime by visiting
                <a href="https://ekhayasmartscholars.onrender.com" target="_blank" style="color: #4B0082; text-decoration: none;">
                  www.ekhayasmartscholars.com
                </a>. Log in using your <strong>Student Number</strong> or <strong>ID Number</strong> along with your <strong>Password</strong>.
              </p>

              <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;" />

              <p style="font-size: 14px; color: #000026; text-align: center;">
                📧 This is an automated message from Ekhaya Smart Scholars Admissions. Please do not reply to this email.
              </p>
              <p style="font-size: 14px; color: #000026; text-align: center;">
                For help, email us at <a href="mailto:ekhayasmartscholars@gmail.com" style="color: #E74C3C;">ekhayasmartscholars@gmail.com</a> or call +27 (72) 343-8377.
              </p>

              <p style="font-size: 13px; color: #000026; text-align: center; margin-top: 20px;">
                © ${new Date().getFullYear()} Ekhaya Smart Scholars – Empowering your academic journey.
              </p>
            </div>
            `
        });

        res.render('home', { applicant });

    } catch (err) {
        if (err.code === 11000) {
            return res.render('error', {
                title: 'Registration Error',
                message: 'An applicant with the same email or ID number already exists. Please use different details or try logging in.'
            });
        }
        res.status(404).render('error', {
            title: '404 - Page Not Found',
            message: null
        });
    }

};

exports.showLoginForm = (req, res) => {
    res.render('login', { message: '' });
};

exports.login = async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const applicant = await Applicant.findOne({
            $or: [{ idNumber: identifier }, { studentNumber: identifier }],
            password: password
        });

        if (applicant) {
            res.render('home', { applicant });
        } else {
            res.render('login', {
                message: 'User not found. Check Student/ID number and password.'
            });
        }
    } catch (err) {
        res.render('adminLogin', { message: 'Ekhaya Team is currently working on the system we are aware of the error please try again later' });
    }
};
// === Forgot Password Flow

exports.showForgotPasswordPage = (req, res) => {
  res.render('forgot-password', { stage: 1, email: '', code: '', message: '' });
};

exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const applicant = await Applicant.findOne({ email });
    if (!applicant) {
      return res.render('forgot-password', {
        stage: 1,
        email,
        code: '',
        message: 'Email not found.'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    applicant.resetCode = otp;
    applicant.resetCodeExpiry = expiry;
    await applicant.save();

    await transporter.sendMail({
      from: `"Ekhaya Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Password Reset Code (Expires in 10 mins)',
      html: `
        <p>Hello ${applicant.name},</p>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p><b>This code will expire in 10 minutes.</b></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>– Ekhaya Smart Scholars Support Team</p>
      `
    });

    return res.render('forgot-password', {
      stage: 2,
      email,
      code: '',
      message: 'Verification code sent to your email.'
    });

  } catch (err) {
    return res.render('forgot-password', {
      stage: 1,
      email,
      code: '',
      message: 'Something went wrong. Please try again.'
    });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, code } = req.body;

  try {
    const applicant = await Applicant.findOne({ email });
    if (!applicant || !applicant.resetCode || applicant.resetCode !== code) {
      return res.render('forgot-password', {
        stage: 2,
        email,
        code: '',
        message: 'The code is incorrect please verify it and try  again.'
      });
    }

    if (new Date() > applicant.resetCodeExpiry) {
      return res.render('forgot-password', {
        stage: 2,
        email,
        code: '',
        message: 'Code has expired.'
      });
    }

    return res.render('forgot-password', {
      stage: 3,
      email,
      code,
      message: 'Code verified. Enter your new password.'
    });

  } catch (err) {
    return res.render('forgot-password', {
      stage: 2,
      email,
      code: '',
      message: 'Server error.'
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, code, newPassword, confirmPassword } = req.body;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.render('forgot-password', {
      stage: 3,
      email,
      code,
      message: 'Password must be at least 8 characters, include uppercase, lowercase, a number, and a special character.'
    });
  }

  if (newPassword !== confirmPassword) {
    return res.render('forgot-password', {
      stage: 3,
      email,
      code,
      message: 'Passwords do not match.'
    });
  }

  try {
    const applicant = await Applicant.findOne({ email });

    if (!applicant || applicant.resetCode !== code || new Date() > applicant.resetCodeExpiry) {
      return res.render('forgot-password', {
        stage: 3,
        email,
        code,
        message: 'Invalid or expired code.'
      });
    }

    applicant.password = newPassword;
    applicant.resetCode = undefined;
    applicant.resetCodeExpiry = undefined;
    await applicant.save();

    return res.render('login', {
      message: 'Password reset successful. Please log in.',
      messageType: 'success'
    });

  } catch (err) {
    return res.render('forgot-password', {
      stage: 3,
      email,
      code,
      message: 'Server error. Try again.'
    });
  }
};
