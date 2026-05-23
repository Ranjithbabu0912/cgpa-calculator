const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({

    registerNo: {
        type: String,
        required: true
    },

    student: String,

    department: String,

    batch: String,

    semester: Number,

    subjectCode: String,

    subjectName: String,

    internalMarks: Number,

    externalMarks: Number,

    totalMarks: Number,

    credits: Number,

    grade: String,

    status: String,

    photoUrl: String,

    semesterExamId: Number,

    updatedAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    'Result',
    resultSchema
);