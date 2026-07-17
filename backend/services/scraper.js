const axios = require('axios');

const Result = require('../models/Result');

const analyzeResults =
    require('../utils/analyzeResults');

function getGradeFromMarks(total) {

    if (total >= 95) return 'O+';
    if (total >= 90) return 'O';
    if (total >= 85) return 'D++';
    if (total >= 80) return 'D+';
    if (total >= 75) return 'D';
    if (total >= 70) return 'A++';
    if (total >= 65) return 'A+';
    if (total >= 60) return 'A';
    if (total >= 55) return 'B+';
    if (total >= 50) return 'B';
    if (total >= 45) return 'C+';
    if (total >= 40) return 'C';

    return 'U';
}

function convertDOBToISO(dob) {

    const [day, month, year] =
        dob.split('-');

    const date = new Date(

        `${year}-${month}-${day}T00:00:00+05:30`
    );

    return date.toISOString();
}

async function scrapeResults(

    registerNo,

    dob

) {

    try {

        const isoDob =
            convertDOBToISO(dob);

        const exams = [

            {
                id: 66,
                name: 'NOV 2025'
            },

            {
                id: 74,
                name: 'CURRENT'
            }
        ];

        let allSubjects = [];

        let studentInfo = null;

        for (const exam of exams) {
            try {
                console.log(
                    `Fetching ${exam.name}`
                );

                const response =
                    await axios.get(

                        `http://117.240.157.45/CMSAPP/api/coe/semester-exam/view-exam-result`,

                        {
                            params: {

                                dateOfBirth:
                                    isoDob,

                                regNo:
                                    registerNo,

                                semesterExamId:
                                    exam.id
                            }
                        }
                    );

                const json =
                    response.data;

                if (json) {
                    studentInfo = json;
                    const subjectsList = json.ExamResultSubjects || [];
                    const isHolded = 
                        json.IsResultHolded === 'Y' || 
                        json.IsResultHolded === 'Yes' || 
                        json.isResultHolded === 'Y' || 
                        json.isResultHolded === 'Yes' || 
                        json.IsResultHold === 'Y' || 
                        json.IsResultHold === 'Yes' || 
                        json.isResultHold === 'Y' || 
                        json.isResultHold === 'Yes' || 
                        (json.ResultStatus && json.ResultStatus.toString().toLowerCase().includes('held')) ||
                        (json.resultStatus && json.resultStatus.toString().toLowerCase().includes('held')) ||
                        subjectsList.some(
                            subj => 
                                subj.IsResultHolded === 'Y' || 
                                subj.IsResultHolded === 'Yes' || 
                                subj.isResultHolded === 'Y' || 
                                subj.isResultHolded === 'Yes' || 
                                subj.IsResultHold === 'Y' || 
                                subj.IsResultHold === 'Yes' || 
                                subj.isResultHold === 'Y' || 
                                subj.isResultHold === 'Yes' || 
                                (subj.ResultStatus && subj.ResultStatus.toString().toLowerCase().includes('held')) ||
                                (subj.resultStatus && subj.resultStatus.toString().toLowerCase().includes('held'))
                        );

                    console.log(`Exam ${exam.name} API Response (isHolded = ${isHolded}):`, {
                        subjectsCount: subjectsList.length,
                        hasHoldedSubject: subjectsList.some(s => s.IsResultHolded === 'Y' || (s.ResultStatus && s.ResultStatus.toString().toLowerCase().includes('held')))
                    });

                    if (json.ExamResultSubjects && json.ExamResultSubjects.length > 0) {
                        const subjects = json.ExamResultSubjects.map(
                            subj => {
                                const total = Number(subj.TotalMark || 0);
                                const subjHolded = isHolded || 
                                    subj.IsResultHolded === 'Y' || 
                                    (subj.ResultStatus && subj.ResultStatus.toString().toLowerCase().includes('held'));
                                return {
                                    registerNo,
                                    student: json.StudentName,
                                    department: json.DepartmentName,
                                    batch: json.BatchName,
                                    semester: Number(subj.SemesterNo || 0),
                                    subjectCode: subj.SubjectCode,
                                    subjectName: subj.SubjectName,
                                    internalMarks: Number(subj.InternalMark || 0),
                                    externalMarks: Number(subj.ExternalMark || 0),
                                    totalMarks: total,
                                    credits: Number(subj.CreditPoint || 4),
                                    grade: subj.Grade || getGradeFromMarks(total),
                                    status: total >= 40 ? 'Pass' : 'Fail',
                                    isResultHolded: subjHolded ? 'Y' : 'N',
                                    resultStatus: subjHolded ? 'With Held' : (json.ResultStatus || 'Declared'),
                                    semesterExamId: exam.id,
                                    photoUrl: studentInfo?.Student_Seq
                                        ? `${process.env.BASE_URL || 'http://localhost:5001'}/api/student-photo/${studentInfo.Student_Seq}`
                                        : null
                                };
                            }
                        );
                        allSubjects.push(...subjects);
                    } else if (isHolded) {
                        const semesterNo = Number(json.SemesterNo || json.Semester || (exam.id === 66 ? 1 : 2));
                        allSubjects.push({
                            registerNo,
                            student: json.StudentName || 'Student',
                            department: json.DepartmentName || '',
                            batch: json.BatchName || '',
                            semester: semesterNo,
                            subjectCode: 'WITHHELD',
                            subjectName: 'Results Withheld',
                            internalMarks: 0,
                            externalMarks: 0,
                            totalMarks: 0,
                            credits: 0,
                            grade: 'U',
                            status: 'Withheld',
                            isResultHolded: 'Y',
                            resultStatus: 'With Held',
                            semesterExamId: exam.id,
                            photoUrl: studentInfo?.Student_Seq
                                ? `${process.env.BASE_URL || 'http://localhost:5001'}/api/student-photo/${studentInfo.Student_Seq}`
                                : null
                        });
                    }
                }
            } catch (examError) {
                console.warn(`  Warning: Failed to fetch ${exam.name} for ${registerNo}:`, examError.response?.data?.Message || examError.message);
            }
        }

        if (allSubjects.length === 0) {
            throw new Error('No results found / Student not found on college portal');
        }

        const uniqueSubjects = [

            ...new Map(

                allSubjects.map(item => [

                    `${item.semester}-${item.subjectCode}`,

                    item
                ])

            ).values()
        ];

        const semestersToUpdate = [...new Set(uniqueSubjects.map(item => item.semester))];
        for (const sem of semestersToUpdate) {
            await Result.deleteMany({ registerNo, semester: sem });
        }

        for (const item of uniqueSubjects) {

            await Result.updateOne(

                {
                    registerNo:
                        item.registerNo,

                    semester:
                        item.semester,

                    subjectCode:
                        item.subjectCode
                },

                {
                    $set: {
                        ...item,
                        updatedAt: new Date()
                    }
                },

                {
                    upsert: true
                }
            );
        }

        const allResults =
            await Result.find({

                registerNo
            });

        const analytics =
            analyzeResults(
                allResults
            );

        return {

            success: true,

            student:
                studentInfo?.StudentName,

            department:
                studentInfo?.DepartmentName,

            batch:
                studentInfo?.BatchName,

            photoUrl:

                studentInfo?.Student_Seq

                    ? `${process.env.BASE_URL || 'http://localhost:5001'}/api/student-photo/${studentInfo.Student_Seq}`

                    : null,

            results:
                allResults,

            ...analytics
        };

    } catch (error) {

        console.log(error);

        throw error;
    }
}

module.exports =
    scrapeResults;