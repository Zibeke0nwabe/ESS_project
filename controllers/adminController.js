const Admin = require('../models/Admin');
const Applicant = require('../models/Applicant');
const transporter = require('../config/email');

exports.showAdminLogin = (req, res) => {
    res.render('adminLogin', { message: '' });
};

exports.handleAdminLogin = async (req, res) => {
    try {
        const admin = await Admin.findOne({ username: req.body.username });
        if (admin && admin.password === req.body.password) {
            const applicants = await Applicant.find();
            res.render('admin', { applicants });
        } else {
            res.render('adminLogin', { message: 'Invalid admin credentials' });
        }
    } catch (err) {
        res.status(404).sendFile(path.join(__dirname, '../views/error.html'));
    }
};

exports.makeDecision = async (req, res) => {
    const { id, decision } = req.body;
    try {
        const applicant = await Applicant.findById(id);
        if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

        applicant.status = decision === 'accept' ? 'Accepted' : 'Rejected';
        await applicant.save();

        const subject = decision === 'accept'
            ? '🎉 You’ve Been Accepted to Ekhaya Smart Scholars'
            : '❌ Application Update – Ekhaya Smart Scholars';

        const htmlContent = decision === 'accept'
            ? `<div style="padding: 20px;">Congrats ${applicant.name}, your application is accepted!</div>`
            : `<div style="padding: 20px;">Sorry ${applicant.name}, your application was not successful.</div>`;

        await transporter.sendMail({
            from: `"Ekhaya Admissions" <${process.env.EMAIL_USER}>`,
            to: applicant.email,
            subject,
            html: htmlContent
        });

        res.json({ message: `Application ${decision}ed and email sent.` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};