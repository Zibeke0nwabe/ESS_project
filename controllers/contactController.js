const transporter = require('../config/email');

exports.sendMessage = async (req, res) => {
    const { name, email, message } = req.body;

    try {
        await transporter.sendMail({
            from: `"Contact Form" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: '📩 New Contact Message',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h3>New Contact Message</h3>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong><br/>${message}</p>
                </div>
            `
        });

        await transporter.sendMail({
            from: `"Ekhaya Smart Scholars" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '✅ We Received Your Message',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Thanks, ${name}!</h2>
                    <p>We've received your message and will respond shortly.</p>
                    <blockquote>${message}</blockquote>
                    <p>Best regards,<br/>Ekhaya Smart Scholars Team</p>
                </div>
            `
        });

        res.status(200).send('<script>alert("Message sent successfully!"); window.location.href="/";</script>');

    } catch (err) {
        console.error(err);
        res.status(500).send('<script>alert("Failed to send message. Please try again."); window.location.href="/";</script>');
    }
};
