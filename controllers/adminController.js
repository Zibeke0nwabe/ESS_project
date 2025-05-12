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
            ? `<div style="font-family: Arial, sans-serif; background-color: #000026; padding: 40px 0;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
              <p style="color: #000026; text-align: center; font-size: 26px; margin-bottom: 10px;">
                🎉 Dear  ${applicant.name}, You're Accepted!
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #000026;">
                We are thrilled to inform you that your application to the <strong>Ekhaya Smart Scholars</strong> program has been <strong>Accepted</strong>. Congratulations on this significant achievement!
              </p>
          
              <h3 style="color: #000026; font-size: 18px; margin-top: 20px;">📋 Application Details:</h3>
              <ul style="font-size: 16px; line-height: 1.6; color: #000026; padding-left: 20px;">
                    <li><strong>Student Number:</strong> ${applicant.studentNumber}</li>
                    <li><strong>Email:</strong> ${applicant.studentNumber}@ess.co.za</li>
                    <li><strong>Phone:</strong> ${applicant.phone}</li>
                    <li><strong>ID Number:</strong> ${applicant.idNumber}</li>
                    <li><strong>Password:</strong> ${applicant.password}</li>
              </ul>          
              <div style="margin: 30px 0; text-align: center;">
                <a href="https://ess.co.za/login" style="background-color: #4B0082; color: #ffffff; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-weight: bold;">
                  👉 Login to Start Learning
                </a>
              </div>
          
              <p style="font-size: 16px; line-height: 1.6; color: #000026;">
                At <strong>Ekhaya Smart Scholars</strong>, we are committed to empowering students like you with the tools and resources needed for academic success. Our program offers:
              </p>
          
              <ul style="font-size: 16px; line-height: 1.6; color: #000026; padding-left: 20px;">
                <li> <strong>Expert Tutors:</strong> Learn from experienced educators dedicated to your success.</li>
                <li> <strong>Comprehensive Study Materials:</strong> Access a wide range of resources to aid your learning.</li>
                <li> <strong>Interactive Learning Environment:</strong> Engage in a dynamic and supportive online community.</li>
              </ul>
          
              <p style="font-size: 16px; line-height: 1.6; color: #000026;">
                We are excited to support you in achieving your academic goals. Should you have any questions or need assistance, please do not hesitate to reach out.
              </p>
          
              <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;" />
          
              <p style="font-size: 14px; color: #000026; text-align: center;">
                📧 Need help? Email us at <a href="mailto:ekhayasmartscholars@gmail.com" style="color: #E74C3C;">ekhayasmartscholars@gmail.com</a> or call +27 (72) 343-8377
              </p>
          
              <p style="font-size: 13px; color: #000026; text-align: center; margin-top: 20px;">
                © ${new Date().getFullYear()} Ekhaya Smart Scholars – Empowering your academic journey.
              </p>
            </div>
          </div>
          `
            : `<div style="padding: 20px;">
            <h2>Dear ${applicant.name},</h2>
            <p>We regret to inform you that your application has not been successful. Below are your application details:</p>
            <ul>
                <li><strong>Student Number:</strong> ${applicant.studentNumber}</li>
                <li><strong>Phone:</strong> ${applicant.phone}</li>
                <li><strong>ID Number:</strong> ${applicant.idNumber}</li>
                <li><strong>Password:</strong> ${applicant.password}</li>
            </ul>
            <p>This decision was based on the highly competitive nature of the selection process. We encourage you to continue pursuing your academic aspirations and to apply again in the future.</p>
            <p>If you would like feedback on your application or have any questions, please feel free to contact us.</p>
            <p>We wish you all the best in your future endeavors.</p>
            <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;" />
          
              <p style="font-size: 14px; color: #000026; text-align: center;">
                📧 Need help? Email us at <a href="mailto:ekhayasmartscholars@gmail.com" style="color: #E74C3C;">ekhayasmartscholars@gmail.com</a> or call +27 (72) 343-8377
              </p>
          
              <p style="font-size: 13px; color: #000026; text-align: center; margin-top: 20px;">
                © ${new Date().getFullYear()} Ekhaya Smart Scholars – Empowering your academic journey.
              </p>`;

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