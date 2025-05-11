const Applicant = require('../models/Applicant');
const transporter = require('../config/email'); 
const path = require('path');

function generateStudentNumber() {
    const prefix = '24';
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
        province, town, Suburb, addressCode, education, eduYear, school, Courses, idCopy, certificateCopy, parentID,
        mathsType, mathsLevel, scienceLevel, qLevel, qName, tertiary
    } = req.body;

    try {
        const studentNumber = generateStudentNumber();
        const applicant = new Applicant({
            title, name, surname, password, studentNumber, idNumber, DOB, marital, language, gender, mobile, altmobile, email,
            province, town, Suburb, addressCode, education, eduYear, school, Courses, idCopy, certificateCopy, parentID,
            mathsType, mathsLevel, scienceLevel, qLevel, qName, tertiary
        });

        await Applicant.create(applicant);

        await transporter.sendMail({
            from: `"Ekhaya Smart Scholars Admissions" <${process.env.EMAIL_USER}>`,
            to: applicant.email,
            subject: 'Application Confirmation - Submitted Successfully',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Dear ${applicant.name} ${applicant.surname},</h2>
                    <p>We’ve successfully received your application to <strong>Ekhaya Smart Scholars</strong>.</p>
                    <p>Your student number is <strong>${applicant.studentNumber}</strong>.</p>
                    <p>Please keep your login credentials safe. You’ll receive updates soon.</p>
                </div>
            `
        });

        res.render('home', { applicant });

    } catch (err) {
        console.error(err);
        res.status(404).sendFile(path.join(__dirname, '../views/error.html'));
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
        res.status(404).sendFile(path.join(__dirname, '../views/error.html'));
    }
};
