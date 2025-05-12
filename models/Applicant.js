const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const applicantSchema = new mongoose.Schema({
    title: { type: String, required: true },
    name: { type: String, required: true },
    surname: { type: String },
    password: { type: String, required: true },
    studentNumber: { type: String, unique: true },
    idNumber: { type: String, required: true, unique: true },
    DOB: { type: String, required: true },
    marital: { type: String, required: true },
    language: { type: String },
    gender: { type: String },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    altmobile: { type: String },
    province: { type: String },
    town: { type: String },
    Suburb: { type: String },
    addressCode: { type: String, required: true },
    education: { type: String, required: true },
    eduYear: { type: String },
    school: { type: String },
    Courses: { type: String },
    idCopy: { type: String },
    certificateCopy: { type: String },
    parentID: { type: String },
    mathsLevel: { type: String },
    scienceLevel: { type: String },
    accountingLevel: { type: String },
    geographyLevel: { type: String },
    lifeScienceLevel: { type: String },
    businessStudiesLevel: { type: String },
    economicsLevel: { type: String },
    agriculturalScienceLevel: { type: String },
    selectedSubjects: [{ type: String }],         

    status: { type: String, default: 'Pending' },
});
    // Trying to hash passwords
    applicantSchema.pre('save', async function (next) {
        if (!this.isModified('password')) return next();

        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (err) {
            next(err);
        }
    });

module.exports = mongoose.model('Applicant', applicantSchema, 'ekhayaApplicants');
