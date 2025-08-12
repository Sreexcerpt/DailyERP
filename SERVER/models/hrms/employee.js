const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({


  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  role: [],
  department: String,
  qualification: String,
  otherQualification: String,
  experience: Number,
  dob: String,
  joinDate: String,
  address: String,
  gender: String,
  employmentType: String,
  status: String,
  salary: String,
  employeeId: String,
  subjects: [{ subjectCode: String, subjectName: String }],
  password: String,
  profilePhoto: String,
  resetCode: String,
  resetCodeExpiry: Date,
  Feedbacks: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Registration" },
    course: String,
    batch: String,
    rating: String,
    review: String,
    subject: String
  }],
  assignedEnquiries: [{ type: mongoose.Schema.Types.ObjectId, ref: "Enquiry" }],
  followUps: [{
    enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: "Enquiry" },
    status: String,
    followedUpDate: String,
    nextFollowUpDate: String,
    remark: String
  }],
  documents: {
    photo: {
      filename: String,
      path: String,
      contentType: String,
      uploadDate: { type: Date, default: Date.now }
    },
    offerLetter: { filename: String, path: String, contentType: String, uploadDate: { type: Date, default: Date.now }},
    idProof: { filename: String, path: String, contentType: String, uploadDate: { type: Date, default: Date.now }},
    addressProof: { filename: String, path: String, contentType: String, uploadDate: { type: Date, default: Date.now }},
    educationCertificates: { filename: String, path: String, contentType: String, uploadDate: { type: Date, default: Date.now }},
    bankDetails: { filename: String, path: String, contentType: String, uploadDate: { type: Date, default: Date.now }}
  }
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);
