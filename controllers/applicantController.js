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
        mathsLevel, scienceLevel, accountingLevel, geographyLevel, lifeScienceLevel, businessStudiesLevel,
        economicsLevel, agriculturalScienceLevel, selectedSubjects
    } = req.body;

    try {
        const studentNumber = generateStudentNumber();

        const applicant = new Applicant({
            title, name, surname, password, studentNumber, idNumber, DOB, marital, language, gender, mobile, altmobile, email,
            province, town, Suburb, addressCode, education, eduYear, school, Courses, idCopy, certificateCopy, parentID,
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
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
                    <p>Dear ${applicant.name} ${applicant.surname},</p>
                    <p>Thank you for submitting your application. Your application has been successfully received.</p>
                    
                    <p><strong>Student Number:</strong> ${applicant.studentNumber}</p>
                    <p><strong>Grade Level Applied For:</strong> ${applicant.gradeLevel}</p>
                    
                    <p><strong>Subjects Selected:</strong></p>
                    <ul style="padding-left: 20px;">
                        ${applicant.selectedSubjects.map(subject => `<li>${subject}</li>`).join('')}
                    </ul>

                    <hr style="margin: 20px 0;" />

                    <p style="font-size: 14px; color: #333;">
                        You will receive further communication regarding your admission shortly.
                    </p>

                    <p style="font-size: 13px; color: #666;">
                        If you have any questions, feel free to contact us at 
                        <a href="mailto:ekhayasmartscholars@gmail.com">ekhayasmartscholars@gmail.com</a>.
                    </p>
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
        console.error(err);
        res.status(404).sendFile(path.join(__dirname, '../views/error.html'));
    }
};