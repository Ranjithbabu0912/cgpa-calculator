const express = require('express');
const axios = require('axios');
const router = express.Router();

// Helper to clean and parse JSON from markdown code fences
function cleanAndParseJSON(text) {
    if (!text) return null;
    let cleanText = text.trim();

    // Remove markdown code fences if present
    if (cleanText.startsWith('```')) {
        const lines = cleanText.split('\n');
        if (lines[0].startsWith('```')) {
            lines.shift();
        }
        if (lines[lines.length - 1].startsWith('```')) {
            lines.pop();
        }
        cleanText = lines.join('\n').trim();
    }

    const startIdx = cleanText.indexOf('{');
    const endIdx = cleanText.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        cleanText = cleanText.substring(startIdx, endIdx + 1);
    }

    return JSON.parse(cleanText);
}

// Helper to generate local analysis in case AI providers are unavailable
function generateLocalAnalysis({
    studentName,
    currentCgpa,
    totalCredits,
    targetCgpa,
    totalSemesters,
    completedSemesters,
    remainingSemesters,
    requiredSgpa,
    maxAchievableCgpa,
    backlogCount,
    lowGrades
}) {
    let feasibilityText = '';
    const reqSgpaNum = parseFloat(requiredSgpa);

    if (remainingSemesters === 0) {
        feasibilityText = "Your course is already completed. Your final CGPA is locked at " + currentCgpa + ".";
    } else if (reqSgpaNum > 10) {
        feasibilityText = `A target of ${targetCgpa} is mathematically impossible from your current position because it would require an SGPA of ${requiredSgpa} (which exceeds the 10.0 scale limit). However, you can reach a maximum of ${maxAchievableCgpa} if you secure a perfect 10.0 SGPA in all remaining semesters.`;
    } else if (reqSgpaNum >= 9.0) {
        feasibilityText = `Highly challenging but mathematically possible. Reaching your target of ${targetCgpa} requires scoring an average of ${requiredSgpa} SGPA in all remaining semesters. You must aim for straight O/O+ grades and maximize your continuous internal assessment (CIA) marks.`;
    } else if (reqSgpaNum >= 8.0) {
        feasibilityText = `Moderately challenging. Reaching your target of ${targetCgpa} requires an average SGPA of ${requiredSgpa} in the remaining semesters. Focused preparation in core subjects will comfortably get you there.`;
    } else {
        feasibilityText = `Highly feasible! Reaching your target of ${targetCgpa} requires a modest average SGPA of ${requiredSgpa} in your remaining semesters. Maintaining your current study patterns will keep you on track.`;
    }

    const summaryText = `${studentName ? studentName + ', your' : 'Your'} current CGPA stands at ${currentCgpa} across ${completedSemesters} semester(s) with ${totalCredits} credits. ${backlogCount > 0
        ? `You have ${backlogCount} pending backlog(s) that need immediate attention to unlock your CGPA progression.`
        : 'You have maintained clean academic records with no active backlogs.'
        }`;

    const semesterRoadmap = [];
    for (let sem = completedSemesters + 1; sem <= totalSemesters; sem++) {
        const targetForSem = reqSgpaNum > 10 ? 10.0 : Math.max(reqSgpaNum, 4.0);
        semesterRoadmap.push({
            semester: sem,
            targetSgpa: parseFloat(targetForSem.toFixed(2)),
            focusAreas: sem === completedSemesters + 1 && backlogCount > 0
                ? "Primary focus must be clearing the existing backlogs alongside new syllabus modules."
                : "Focus on maximizing internal CIA marks (assignments & test scores) and master core topics early."
        });
    }

    const subjectStrategies = lowGrades.map(subj => {
        let strategy = '';
        if (subj.grade === 'U') {
            strategy = "Prioritize clearing this backlog in the next semester. Review previous exam papers, focus on continuous internal assessments (CIA), and seek guidance from professors.";
        } else if (['C', 'C+', 'B'].includes(subj.grade)) {
            strategy = "Reinforce core concepts. Use reference textbooks, attend laboratory sessions carefully, and ensure neat presentation of answers in term-end exams.";
        } else {
            strategy = "Good attempt, but can be improved to an A/D/O grade. Focus on scoring full internal marks (CIA) and solve mock papers.";
        }
        return {
            subjectCode: subj.subjectCode,
            subjectName: subj.subjectName,
            currentGrade: subj.grade,
            strategy
        };
    });

    const generalTips = [
        "Maximize Internal Marks (CIA): Internal tests and assignments carry substantial weight. Scoring near 100% in internals provides a massive buffer for term-end exams.",
        "Target High-Credit Subjects: Prioritize subjects with higher credits (e.g., 4 or 5 credit courses), as grade points secured in these courses have a much larger impact on your SGPA/CGPA.",
        "Regular Backlog Resolution: Always clear active backlogs in the immediate next semester. Dragging backlogs forward creates massive academic stress and negatively affects new semester preparation.",
        "Structured Answer Presentation: In term-end exams, structure answers with clear headings, diagrams, and bullet points. In university evaluations, clean presentation often helps secure higher marks."
    ];

    return {
        summary: summaryText,
        feasibility: feasibilityText,
        semesterRoadmap,
        subjectStrategies,
        generalTips,
        source: 'local'
    };
}

router.post('/ai-analysis', async (req, res) => {
    try {
        const {
            studentName,
            currentCgpa,
            totalCredits,
            results = [],
            targetCgpa = 9.0,
            totalSemesters = 4
        } = req.body;

        const currentCgpaNum = parseFloat(currentCgpa) || 0;
        const targetCgpaNum = parseFloat(targetCgpa) || 9.0;
        const totalSemestersNum = parseInt(totalSemesters) || 4;

        // Calculate completed semesters
        const uniqueSemesters = [...new Set(results.map(r => r.semester))];
        const completedSemesters = uniqueSemesters.length > 0 ? Math.max(...uniqueSemesters) : 0;
        const remainingSemesters = Math.max(0, totalSemestersNum - completedSemesters);

        // Find backlogs and lower grades
        const backlogCount = results.filter(r => r.grade === 'U' || r.status === 'Fail').length;
        const lowGrades = results.filter(r => ['U', 'C', 'C+', 'B', 'B+'].includes(r.grade));

        // Math calculations
        let requiredSgpa = '0.00';
        let maxAchievableCgpa = currentCgpaNum.toFixed(2);

        if (remainingSemesters > 0) {
            const reqSgpaVal = ((targetCgpaNum * totalSemestersNum) - (currentCgpaNum * completedSemesters)) / remainingSemesters;
            requiredSgpa = reqSgpaVal.toFixed(2);

            const maxVal = ((currentCgpaNum * completedSemesters) + (10.0 * remainingSemesters)) / totalSemestersNum;
            maxAchievableCgpa = maxVal.toFixed(2);
        }

        const statsData = {
            studentName,
            currentCgpa: currentCgpaNum.toFixed(2),
            totalCredits,
            targetCgpa: targetCgpaNum.toFixed(2),
            totalSemesters: totalSemestersNum,
            completedSemesters,
            remainingSemesters,
            requiredSgpa,
            maxAchievableCgpa,
            backlogCount,
            lowGrades
        };

        const geminiKey = process.env.GEMINI_API_KEY;

        // 1. Try Gemini API if Key is present
        if (geminiKey && geminiKey.trim() !== '' && !geminiKey.startsWith('placeholder')) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
                const promptContent = `You are a premium academic counselor AI. Analyze the student's academic data and targets:
- Student Name: ${studentName || 'Student'}
- Current CGPA: ${currentCgpaNum.toFixed(2)}
- Completed Semesters: ${completedSemesters}
- Total Semesters in Program: ${totalSemestersNum}
- Remaining Semesters: ${remainingSemesters}
- Target CGPA: ${targetCgpaNum.toFixed(2)}
- Required average SGPA in remaining semesters to achieve target: ${requiredSgpa}
- Maximum achievable CGPA if they score perfect 10.0 SGPA: ${maxAchievableCgpa}
- Backlog subjects count: ${backlogCount}
- Weak/Low-grade subjects list: ${JSON.stringify(lowGrades.map(g => ({ code: g.subjectCode, name: g.subjectName, grade: g.grade, marks: g.totalMarks })))}

Provide a structured academic plan. Your response must conform exactly to the required JSON schema structure. Output ONLY raw JSON matching the schema, with no markdown code blocks.

JSON schema:
{
  "summary": "String summarizing current status",
  "feasibility": "String explaining how achievable the target is",
  "semesterRoadmap": [
    {
      "semester": Integer,
      "targetSgpa": Float,
      "focusAreas": "String explaining what they should focus on this semester"
    }
  ],
  "subjectStrategies": [
    {
      "subjectCode": "String",
      "subjectName": "String",
      "currentGrade": "String",
      "strategy": "String explaining how to improve or clear backlog"
    }
  ],
  "generalTips": [
    "String tip 1",
    "String tip 2"
  ]
}`;

                const payload = {
                    contents: [
                        {
                            parts: [
                                {
                                    text: promptContent
                                }
                            ]
                        }
                    ]
                };

                const response = await axios.post(url, payload, { timeout: 15000 });
                const part = response.data?.candidates?.[0]?.content?.parts?.[0];

                if (part && part.text) {
                    const aiData = cleanAndParseJSON(part.text);
                    if (aiData) {
                        return res.json({
                            success: true,
                            math: {
                                completedSemesters,
                                remainingSemesters,
                                requiredSgpa,
                                maxAchievableCgpa,
                                isPossible: parseFloat(requiredSgpa) <= 10.0
                            },
                            ...aiData,
                            source: 'gemini'
                        });
                    }
                }
            } catch (geminiError) {
                console.error("Gemini API call failed, falling back directly to local engine:", geminiError.response?.data || geminiError.message);
            }
        }

        // Generate local fallback analysis
        const localAnalysis = generateLocalAnalysis(statsData);
        return res.json({
            success: true,
            math: {
                completedSemesters,
                remainingSemesters,
                requiredSgpa,
                maxAchievableCgpa,
                isPossible: parseFloat(requiredSgpa) <= 10.0
            },
            ...localAnalysis
        });

    } catch (error) {
        console.error("AI Analysis Route Error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to generate goal advisor analysis."
        });
    }
});

module.exports = router;
