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

            if (
                json &&
                json.ExamResultSubjects
            ) {

                studentInfo = json;

                const subjects =

                    json.ExamResultSubjects.map(

                        subj => {

                            const total =

                                Number(
                                    subj.TotalMark || 0
                                );

                            return {

                                registerNo,

                                student:
                                    json.StudentName,

                                department:
                                    json.DepartmentName,

                                batch:
                                    json.BatchName,

                                semester:
                                    Number(
                                        subj.SemesterNo || 0
                                    ),

                                subjectCode:
                                    subj.SubjectCode,

                                subjectName:
                                    subj.SubjectName,

                                internalMarks:
                                    Number(
                                        subj.InternalMark || 0
                                    ),

                                externalMarks:
                                    Number(
                                        subj.ExternalMark || 0
                                    ),

                                totalMarks:
                                    total,

                                credits:
                                    Number(
                                        subj.CreditPoint || 4
                                    ),

                                grade:

                                    subj.Grade ||

                                    getGradeFromMarks(
                                        total
                                    ),

                                status:

                                    total >= 40
                                        ? 'Pass'
                                        : 'Fail',

                                photoUrl:

                                    json.Student_Seq

                                        ? `http://117.240.157.45/CMSAPP/api/User/Account/Photo/Student/${json.Student_Seq}`

                                        : null
                            };
                        }
                    );

                allSubjects.push(
                    ...subjects
                );
            }
        }

        const uniqueSubjects = [

            ...new Map(

                allSubjects.map(item => [

                    `${item.semester}-${item.subjectCode}`,

                    item
                ])

            ).values()
        ];

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
                    $set: item
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

                json.Student_Seq

                    ? `${process.env.BASE_URL}/api/student-photo/${json.Student_Seq}`

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