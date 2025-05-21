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
        province, town, Suburb, addressCode, education, eduYear, school, idCopy, certificateCopy, parentID,
        mathsLevel, scienceLevel, accountingLevel, geographyLevel, lifeScienceLevel, businessStudiesLevel,
        economicsLevel, agriculturalScienceLevel, selectedSubjects
    } = req.body;

    try {
        const studentNumber = generateStudentNumber();

        const applicant = new Applicant({
            title, name, surname, password, studentNumber, idNumber, DOB, marital, language, gender, mobile, altmobile, email,
            province, town, Suburb, addressCode, education, eduYear, school, idCopy, certificateCopy, parentID,
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
                <div style="font-family: Arial, sans-serif; color: #333333; padding: 20px;">
                    <p>Dear ${applicant.name} ${applicant.surname},</p>
                    <h2 style="color: #black; font-size: 24px;">Welcome to Ekhaya Smart Scholars!</h2>
                    <p style="font-size: 16px;">Thank you for submitting your application to <strong style="color: #000000;">Ekhaya Smart Scholars</strong>. We’re thrilled to see your interest in starting a journey into the world of software development!</p>
                    <p style="font-size: 16px;">We’ve successfully received your application, and it is now under review by our admissions team.</p>
                    <h3 style="color: #000000; font-size: 18px; margin-top: 30px;">Your Application Details:</h3>
                    <ol style="padding-left: 20px; font-size: 16px;">
                        <li style="line-height: 1.8;"><strong>Full Name:</strong> ${applicant.name} ${applicant.surname}</li>
                        <li style="line-height: 1.8;"><strong>Student Number:</strong> ${applicant.studentNumber}</li>
                        <li style="line-height: 1.8;"><strong>Login Password:</strong> ${applicant.password}</li>
                    </ol>
                    <p style="background-color: #000000; padding: 12px; text-align: center; border-radius: 6px; color: red; font-weight: bold;">
                        ⚠️ Please keep your Student Number and Password safe — you'll need them to log in and track your application or manage your account.
                    </p>
                    <p style="font-size: 16px; margin-top: 20px;">✅ You will receive a follow-up email once your application has been reviewed and a decision has been made.</p>
                    <p style="font-size: 16px;">
                        You can check your application status anytime by visiting 
                        <a href="https://ekhayasmartscholars.onrender.com" target="_blank" style="color: #ffbb00; text-decoration: none;">
                            www.ekhayasmartscholars.com
                        </a>. Log in using either your <strong>Student Number</strong> <em>or</em> <strong>ID Number</strong>, along with your <strong>Password</strong>.
                    </p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
                    <p style="font-size: 14px; color: #777777;">📧 This is an automated message from Ekhaya Smart Scholars Admissions. Please do not reply to this email.</p>
                    <p style="font-size: 14px; color: #777777;">For assistance, contact us through our website or follow us on social media. We regularly post updates on all major platforms—stay connected!</p>
                    <p style="margin-top: 30px;">Regards,<br><br>
                    <strong style="color: #000000;">The Ekhaya Smart Scholars Admissions Team</strong></p>
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

exports.showForgotPasswordPage = (req, res) => {
    res.render('forgot-password');
};

exports.sendOTP = async (req, res) => {
    const { email } = req.body;
    
    try {
        const applicant = await Applicant.findOne({ email });
        if (!applicant) {
            return res.status(400).json({ error: 'Email not found.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

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

        res.status(200).json({ message: 'Code sent.' });
         console.log("EMAIL RECEIVED:", req.body.email)
    } catch (err) {
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
         console.log(err)
    }
};

exports.verifyOTP = async (req, res) => {
    const { email, code } = req.body;

    try {
        const applicant = await Applicant.findOne({ email });
        if (!applicant || !applicant.resetCode) {
            return res.status(400).json({ error: 'Invalid or expired code.' });
        }

        if (applicant.resetCode !== code) {
            return res.status(400).json({ error: 'Incorrect code.' });
        }

        if (new Date() > applicant.resetCodeExpiry) {
            return res.status(400).json({ error: 'Code has expired.' });
        }

        res.status(200).json({ message: 'Code verified.' });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, code, newPassword, confirmPassword } = req.body;

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ error: 'Password does not meet the criteria.' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
    }

    try {
        const applicant = await Applicant.findOne({ email });

        if (!applicant || applicant.resetCode !== code || new Date() > applicant.resetCodeExpiry) {
            return res.status(400).json({ error: 'Invalid or expired code.' });
        }

        applicant.password = newPassword;
        applicant.resetCode = undefined;
        applicant.resetCodeExpiry = undefined;

        await applicant.save();

        res.status(200).json({ message: 'Password reset successful.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reset password.' });
    }
};
