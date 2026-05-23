function analyzeResults(results) {

    if (!results.length) {

        return {

            cgpa: '0.00',

            sgpa: [],

            totalCredits: 0,

            averageMarks: 0,

            highestMark: 0,

            lowestMark: 0,

            highestGrade: '-',

            backlogs: 0,

            passPercentage: 0,

            gradeDistribution: {}
        };
    }

    let totalWeightedPoints = 0;

    let totalCredits = 0;

    let totalMarks = 0;

    const semesterData = {};

    const gradeDistribution = {};

    let highestMark = -Infinity;

    let lowestMark = Infinity;

    let highestGrade = null;

    let passCount = 0;

    const gradesOrder = [

        'O+',
        'O',

        'D++',
        'D+',
        'D',

        'A++',
        'A+',
        'A',

        'B+',
        'B',

        'C+',
        'C',

        'U'
    ];

    results.forEach(result => {

        const credits =
            result.credits || 4;

        const gradePoint =
            result.totalMarks / 10;

        const semester =
            result.semester || 1;

        if (!semesterData[semester]) {

            semesterData[semester] = {

                weightedPoints: 0,

                credits: 0
            };
        }

        semesterData[semester]
            .weightedPoints +=
                gradePoint * credits;

        semesterData[semester]
            .credits += credits;

        totalWeightedPoints +=
            gradePoint * credits;

        totalCredits += credits;

        totalMarks += result.totalMarks;

        if (result.totalMarks > highestMark) {

            highestMark =
                result.totalMarks;
        }

        if (result.totalMarks < lowestMark) {

            lowestMark =
                result.totalMarks;
        }

        if (
            !highestGrade ||

            gradesOrder.indexOf(
                result.grade
            ) <

            gradesOrder.indexOf(
                highestGrade
            )
        ) {

            highestGrade =
                result.grade;
        }

        gradeDistribution[result.grade] =

            (gradeDistribution[result.grade] || 0)
            + 1;

        if (result.grade !== 'U') {

            passCount++;
        }
    });

    const cgpa =
        totalCredits > 0
            ? (
                totalWeightedPoints /
                totalCredits
            ).toFixed(2)
            : '0.00';

    const sgpa = Object.keys(semesterData)

        .map(sem => ({

            semester:
                Number(sem),

            sgpa: (

                semesterData[sem]
                    .weightedPoints /

                semesterData[sem]
                    .credits

            ).toFixed(2)

        }))

        .sort(
            (a, b) =>
                a.semester -
                b.semester
        );

    return {

        cgpa,

        sgpa,

        totalCredits,

        averageMarks:

            (
                totalMarks /
                results.length
            ).toFixed(1),

        highestMark,

        lowestMark,

        highestGrade,

        backlogs:

            results.filter(
                r => r.grade === 'U'
            ).length,

        passPercentage:

            (
                (passCount /
                    results.length) * 100
            ).toFixed(1),

        gradeDistribution
    };
}

module.exports =
    analyzeResults;