const express= require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose')
const ejs = require('ejs')
const path = require('path');
const app = express()

require('dotenv').config();
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, 'public')));


//using css from the public folder
app.use('public/style/style.css',express.static(path.join(__dirname +'public/style/style.css')));
//importing from env
db = process.env.MONGO_URL;
port = process.env.PORT;
//Creating Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// setting ejs
app.set('view engine', 'ejs');
//connecting to mongoDB
mongoose.connect(db).then(()=>{
    console.log('Database connected Successfully')
}).catch(()=>{
    console.log(`Couldn't connect to the database`)
});
//creatng Schema for applicants
const applicantSchema = new mongoose.Schema({
 title:{type:String,required:true}, name: {type:String, required:true},surname:{type:String},password: {type:String, required:true},studentNumber: {type:String,unique:true},idNumber:{type:String,required:true,unique:true},
 DOB: {type:String, required:true},marital: {type:String, required:true},language: {type:String},gender: {type:String},email:{type:String,required:true,unique:true},
 mobile: {type:String, required:true},altmobile: {type:String,},province: {type:String},town: {type:String},Suburb:{type:String},addressCode:{type:String,required:true,}, 
 education: {type:String, required:true},eduYear: {type:String,},school: {type:String},Courses: {type:String},idCopy:{type:String},certificateCopy:{type:String},parentID:{type:String},
 mathsType: { type: String },mathsLevel: { type: String },scienceLevel: { type: String },tertiary:{type:String},qLevel:{type:String},qName:{type:String},status: { type: String, default: 'Pending' },

})

//collection
const applicantModal = new mongoose.model('applicants', applicantSchema)

const adminSchema = new mongoose.Schema({
    username: {type:String},
    password: {type:String}
})
const adminModal = new mongoose.model('admins', adminSchema)

app.get('/',(req,res)=>{
    res.render('index')
})
app.get('/register',(req,res)=>{
    res.sendFile(__dirname +'/views/form.html')
})
app.post('/register', async (req, res) => {
    const {
        title, name, surname, password, idNumber, DOB, marital, language, gender, mobile, altmobile, email,
        province, town, Suburb, addressCode, education, eduYear, school, Courses, idCopy, certificateCopy, parentID,
        mathsType, mathsLevel, scienceLevel, qLevel, qName, tertiary
    } = req.body;

    try {
        const studentNumber = studentNumberGenerator();
        const applicant = new applicantModal({
            title, name, surname, password, studentNumber, idNumber, DOB, marital, language, gender, mobile, altmobile, email,
            province, town, Suburb, addressCode, education, eduYear, school, Courses, idCopy, certificateCopy, parentID,
            mathsType, mathsLevel, scienceLevel, qLevel, qName, tertiary
        });

        await applicantModal.insertMany([applicant]);

        // Send confirmation email
        const mailOptions = {
            from: `"Ekhaya Smart Scholars Admissions - DONOTREPLY" <${process.env.EMAIL_USER}>`,
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
            <li style="line-height: 1.8;"><strong>Courses Applied:</strong> ${applicant.Courses}</li>
            <li style="line-height: 1.8;"><strong>Login Password:</strong> ${applicant.password}</li>
        </ol>
    
        <p style="background-color: #000000; padding: 12px; text-align: center; border-radius: 6px; color: red; font-weight: bold;">
            ⚠️ Please keep your Student Number and Password safe — you'll need them to log in and track your application or manage your account.
        </p>
    
        <p style="font-size: 16px; margin-top: 20px;">✅ You will receive a follow-up email once your application has been reviewed and a decision has been made.</p>
    
        <p style="font-size: 16px;">
            You can check your application status anytime by visiting 
            <a href="https://www.ekhayasmartscholars.onrender.com" target="_blank" style="color: #ffbb00; text-decoration: none;">
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
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email failed to send:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
        res.render('home', { applicant });

    } catch (err) {
        console.error(err);
        res.status(404).sendFile(__dirname + '/views/error.html');
    }
});
function studentNumberGenerator(){
    const prefix = '24';
    const number = '0123456789';
    let studentNumber = prefix;
    for (let i = 0; i <6; i++){
        const uniqueNumber = number.charAt(Math.floor(Math.random()* number.length));
        studentNumber += uniqueNumber;
    }
    return studentNumber;
}
app.get('/login',(req,res)=>{
    let error = ''
    res.render('login',{
       message:error 
    })
})

app.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const applicant = await applicantModal.findOne({
            $or: [{ idNumber: identifier }, { studentNumber: identifier }],
            password: password
        });

        if (applicant) {
            res.render('home', { applicant });
        } else {
            let error = 'User does not exist, Your Student Number (ID number) or Password might be incorrect!';
            res.render('login', { message: error });
        }
    } catch (err) {
        res.status(404).sendFile(__dirname + '/views/error.html');
    }
});

app.get('/admin',(req,res)=>{
    let error = ''
    res.render('adminLogin',{
        message:error
    })
})
app.post('/admin', async (req, res) => {
    try {
        const checkadmin = await adminModal.findOne({ username: req.body.username });

        console.log("checkadmin:", checkadmin);
        let applicants = ''

        if (checkadmin) {
            console.log("Entered checkadmin block");
            console.log("checkadmin.password:", checkadmin.password);
            console.log("req.body.password:", req.body.password);

            if (checkadmin.password === req.body.password) {
                console.log("Passwords match");
                applicantModal.find()
                    .then(applicants => {
                        res.render('admin', {
                            applicants: applicants
                        });
                    });
            } else {
                console.log("Passwords don't match");
                let error = 'Admin details incorrect';
                res.render('adminLogin', {
                    message: error
                });
            }
        } else {
            console.log("Admin not found");
            let error = 'Admin details incorrect';
            res.render('adminLogin', {
                message: error
            });
        }
    } catch(err){
        res.status(404).sendFile(__dirname +'/views/error.html')
    }
});
app.post('/admin/decision', async (req, res) => {
    const { id, decision } = req.body;


    try {
        const applicant = await applicantModal.findById(id);
        if (!applicant) return res.status(404).json({ message: 'Applicant not found' });
        applicant.status = decision === 'accept' ? 'Accepted' : 'Rejected';
        await applicant.save();
        // Send acceptance or rejection email
        const subject = decision === 'accept' 
            ? '🎉 Congratulations! You’ve Been Accepted to Ekhaya Smart Scholars'
            : '❌ Application Update – Ekhaya Smart Scholars';
        
        const htmlContent = decision === 'accept' 
            ? `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <p>Dear ${applicant.name} ${applicant.surname},</p><br/>
                    <h2 style="color: #28a745;">🎉 Congratulations!</h2>
                    <p>Your application to <strong>Ekhaya Smart Scholars</strong> has been <strong>accepted</strong>! 🎓</p>
                    <p>Get ready to unlock your future with Us and your details are:</p>
                    <ol style="padding-left: 20px; font-size: 16px;">
                        <li style="line-height: 1.8;"><strong>Full Name:</strong> ${applicant.name} ${applicant.surname}</li>
                        <li style="line-height: 1.8;"><strong>Student Number:</strong> ${applicant.studentNumber}</li>
                        <li style="line-height: 1.8;"><strong>Email Address:</strong> ${applicant.studentNumber}@ess.com</li>
                        <li style="line-height: 1.8;"><strong>Login Password:</strong> ${applicant.password}</li>
                    </ol>
                    <p style="margin-top: 30px;">See you on the platform!<br><br><strong style="color: #000;">The Ekhaya Smart Scholars Admissions Team</strong></p>
                </div>`
            : `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <p>Dear ${applicant.name} ${applicant.surname},</p><br/>
                    <p>Thank you for your interest in <strong>Ekhaya Smart Scholars</strong>.</p>
                    <p>After careful review, we regret to inform you that your application was not successful at this time.</p>
                    <p>We encourage you to continue learning and feel free to apply again in the future.</p>
                    <p style="margin-top: 30px;">Warm regards,<br><br><strong style="color: #000;">The Ekhaya Smart Scholars Admissions Team</strong></p>
                </div>`;

        await transporter.sendMail({
            from: `"Ekhaya Smart Scholars Admissions" <${process.env.EMAIL_USER}>`,
            to: applicant.email,
            subject,
            html: htmlContent
        });

        return res.json({ message: `Application ${decision}ed and email sent.` });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
const subscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    subscribedAt: { type: Date, default: Date.now }
});
const Subscriber = mongoose.model('Subscriber', subscriberSchema);

app.post('/subscribe', async (req, res) => {
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

        const unsubscribeLink = `https://yourdomain.com/unsubscribe?email=${encodeURIComponent(email)}`;

        await transporter.sendMail({
            from: `"Ekhaya Smart Scholars" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Ekhaya Smart Scholars!',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Thank you for subscribing!</h2>
                    <p>You’ll now receive updates about new courses, promotions, and more.</p>
                    <p>If you ever want to unsubscribe, just <a href="${unsubscribeLink}" style="color:red;">click here</a>.</p>
                </div>
            `
        });

        return res.status(200).json({ message: 'Subscribed and email sent.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        // 1. Email to the website admin
        await transporter.sendMail({
            from: `"Contact Form" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // site receives its own message
            subject: '📩 New Contact Message from Website',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h3>New Message from Contact Form</h3>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong></p>
                    <p>${message}</p>
                </div>
            `
        });

        // 2. Acknowledgement email to the user
        await transporter.sendMail({
            from: `"Ekhaya Smart Scholars" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '✅ We Received Your Message',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Thanks for reaching out, ${name}!</h2>
                    <p>We've received your message and our team will respond as soon as possible.</p>
                    <p style="margin-top: 20px;">Here's a copy of what you sent:</p>
                    <blockquote style="margin: 10px 0; padding-left: 15px; border-left: 3px solid #ccc;">
                        ${message}
                    </blockquote>
                    <p style="margin-top: 20px;">Best regards,<br><strong>Ekhaya Smart Scholars Team</strong></p>
                </div>
            `
        });

        res.status(200).send('<script>alert("Message sent successfully!"); window.location.href="/";</script>');

    } catch (err) {
        console.error(err);
        res.status(500).send('<script>alert("Failed to send message. Please try again."); window.location.href="/";</script>');
    }
});

app.use((req, res, next) => {
    res.status(404).sendFile(__dirname +'/views/error.html');
  });
app.listen(port,()=>{
    console.log(`Server connected to Port ${port}`)
})