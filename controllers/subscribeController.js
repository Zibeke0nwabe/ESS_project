const Subscriber = require('../models/Subscriber');
const transporter = require('../config/email');

exports.subscribe = async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'Invalid email address' });
    }

    try {
        const exists = await Subscriber.findOne({ email });
        if (exists) {
            return res.status(200).json({ message: 'You are already subscribed!' });
        }

        const newSub = new Subscriber({ email });
        await newSub.save();

        await transporter.sendMail({
            from: `"Ekhaya Smart Scholars" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Ekhaya Smart Scholars!',
            html: `
            <div style="font-family: Arial, sans-serif; background-color: #000026; padding: 40px 0;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
                    
                    <h2 style="color: #000026; text-align: center; font-size: 26px; margin-bottom: 10px;">You’re Officially Subscribed 🎉</h2>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #000026;">
                        Thank you for joining the <strong>Ekhaya Smart Scholars</strong> community!
                    </p>
    
                    <p style="font-size: 16px; line-height: 1.6; color: #000026;">
                        As a subscriber, you’ll be the first to hear about:
                    </p>
    
                    <ul style="color: #000026; padding-left: 20px; font-size: 16px; line-height: 1.6;">
                        <li>New course launches & exclusive study material</li>
                        <li>Early-bird access to workshops and academic webinars</li>
                        <li>Special discounts and learning tips</li>
                        <li>Matric exam support in Mathematics, Science, Accounting & more</li>
                    </ul>
    
                    <p style="font-size: 16px; color: #000026;">
                        We’re here to help you <strong>bridge learning gaps</strong> and build a strong foundation for your academic success.
                    </p>
    
                    <div style="margin: 30px 0; text-align: center;">
                        <a href="https://www.ekhayasmartscholars.com" 
                            style="background-color: #4B0082; color: #ffffff; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-weight: bold;">
                            Visit Our Website
                        </a>
                    </div>
    
                    <p style="font-size: 14px; color: #000026; text-align: center;">
                        📬 You can unsubscribe or manage your preferences anytime from our site.
                    </p>
    
                    <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;">
    
                    <p style="font-size: 14px; color: #000026; text-align: center;">
                        Need help? Contact us at 
                        <a href="mailto:ekhayasmartscholars@gmail.com" style="color: #E74C3C;">ekhayasmartscholars@gmail.com</a> or call +27 (72) 343-8377
                    </p>
    
                    <p style="font-size: 13px; color: #000026; text-align: center; margin-top: 20px;">
                        © ${new Date().getFullYear()} Ekhaya Smart Scholars – Empowering your academic journey.
                    </p>
                </div>
            </div>
        `
        });

        res.status(200).json({ message: 'Subscribed and email sent.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};