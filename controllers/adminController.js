const Admin = require('../models/Admin');
const Applicant = require('../models/Applicant');
const transporter = require('../config/email');

function generateStrongPassword(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}:"<>?[]';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

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
      res.render('adminLogin', { message: 'Ekhaya Team is currently working on the system we are aware of the error please try again later' });
    }
};

exports.makeDecision = async (req, res) => {
    const { id, decision } = req.body;
    try {
        const applicant = await Applicant.findById(id);
        if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

        applicant.status = decision === 'accept' ? 'Accepted' : 'Rejected';

        let generatedPortalPassword = '';
        let htmlContent = '';
        let subject = '';

        if (decision === 'accept') {
            generatedPortalPassword = generateStrongPassword();
            applicant.portalPassword = generatedPortalPassword;

            subject = 'You’ve Been Accepted to Ekhaya Smart Scholars';
            htmlContent = `
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
              <p style="margin-bottom: 10px;">Dear ${applicant.name} ${applicant.surname},</p>
              <p style="font-size: 16px; line-height: 1.6; color: #000026;">
                We are thrilled to inform you that your application to <strong>Ekhaya Smart Scholars</strong> has been <strong>Accepted</strong>. Congratulations on this significant achievement!
              </p>
              <h3 style="color: #000026; font-size: 18px; margin-top: 20px;">📋 Application Details:</h3>
              <ul style="font-size: 16px; line-height: 1.6; color: #000026; padding-left: 20px;">
                  <li><strong>Student Number:</strong> ${applicant.studentNumber}</li>
                  <li><strong>Email:</strong> ${applicant.studentNumber}@ess.co.za</li>
                  <li><strong>Portal Password:</strong> ${generatedPortalPassword}</li>
              </ul>          
              <div style="margin: 30px 0; text-align: center;">
                <a href="https://ess-portal.onrender.com" style="background-color: #4B0082; color: #ffffff; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-weight: bold;">
                  👉 Login to Start Learning
                </a>
              </div>
              <p style="font-size: 16px; line-height: 1.6; color: #000026;">
                At <strong>Ekhaya Smart Scholars</strong>, we are committed to empowering students like you with the tools and resources needed for academic success.
              </p>
              <ul style="font-size: 16px; line-height: 1.6; color: #000026; padding-left: 20px;">
                <li><strong>Expert Tutors:</strong> Learn from experienced educators.</li>
                <li><strong>Study Materials:</strong> Access a wide range of resources.</li>
                <li><strong>Interactive Environment:</strong> Engage in a supportive community.</li>
              </ul>
              <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;" />
              <p style="font-size: 14px; color: #000026; text-align: center;">
                📧 Need help? Email us at <a href="mailto:ekhayasmartscholars@gmail.com" style="color: #E74C3C;">ekhayasmartscholars@gmail.com</a> or call +27 (72) 343-8377
              </p>
              <p style="font-size: 13px; color: #000026; text-align: center; margin-top: 20px;">
                © ${new Date().getFullYear()} Ekhaya Smart Scholars – Empowering your academic journey.
              </p>
            </div>
            `;
        } else {
            subject = 'Application Update – Ekhaya Smart Scholars';
            htmlContent = `
            <div style="padding: 20px;">
              <p>Dear ${applicant.name} ${applicant.surname},</p>
              <p>We regret to inform you that your application has not been successful.</p>
              <ul>
                  <li><strong>Student Number:</strong> ${applicant.studentNumber}</li>
                  <li><strong>Phone:</strong> ${applicant.mobile}</li>
                  <li><strong>ID Number:</strong> ${applicant.idNumber}</li>
              </ul>
              <p>This decision was based on the highly competitive nature of the selection process. We encourage you to continue pursuing your academic goals and to apply again in the future.</p>
              <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;" />
              <p style="font-size: 14px; color: #000026; text-align: center;">
                📧 Need help? Email us at <a href="mailto:ekhayasmartscholars@gmail.com" style="color: #E74C3C;">ekhayasmartscholars@gmail.com</a> or call +27 (72) 343-8377
              </p>
              <p style="font-size: 13px; color: #000026; text-align: center; margin-top: 20px;">
                © ${new Date().getFullYear()} Ekhaya Smart Scholars – Empowering your academic journey.
              </p>
            </div>`;
        }
        await applicant.save();

        // Send the email
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
