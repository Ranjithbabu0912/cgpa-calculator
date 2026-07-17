import React from 'react';
import ReportFooter from './ReportFooter';
import AiGoalAdvisor from './AiGoalAdvisor';

const AnalysisDashboard = ({ data }) => {

    if (!data || !data.results) return null;

    const activeResults = data.results.filter(
        r => r.isResultHolded !== 'Y' && r.resultStatus !== 'With Held'
    );

    if (activeResults.length === 0) {
        return (
            <div className="analysis-dashboard">
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px dashed rgba(239, 68, 68, 0.2)',
                    borderRadius: '12px',
                    color: 'var(--text-secondary)'
                }}>
                    No results available for analysis (Results Withheld due to pending dues).
                </div>
            </div>
        );
    }

    const avgMarks = (
        activeResults.reduce(
            (sum, r) => sum + r.totalMarks,
            0
        ) / activeResults.length
    ).toFixed(1);

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

    const sortedResults =
        [...activeResults].sort(

            (a, b) =>

                gradesOrder.indexOf(a.grade) -
                gradesOrder.indexOf(b.grade)
        );

    const highestGrade =
        sortedResults[0]?.grade || '-';

    const backlogs =
        activeResults.filter(

            r =>
                r.grade === 'U' ||
                r.grade === 'RA' ||
                r.grade === 'F' ||
                r.grade === 'AB'

        ).length;





    return (
        <div className="analysis-dashboard">
            {/* Top Row: Snapshot Stats */}
            <div style={statsGridStyle}>
                <div style={statBoxStyle}>
                    <div style={statLabelStyle}>Avg. Marks</div>
                    <div style={statValueStyle}>{avgMarks}</div>
                </div>
                <div style={statBoxStyle}>
                    <div style={statLabelStyle}>Highest Grade</div>
                    <div style={{ ...statValueStyle, color: '#fbbf24' }}>{highestGrade}</div>
                </div>
                <div style={{ ...statBoxStyle, borderColor: backlogs > 0 ? 'var(--danger)' : 'var(--border)' }}>
                    <div style={statLabelStyle}>Total Backlogs</div>
                    <div style={{ ...statValueStyle, color: backlogs > 0 ? 'var(--danger)' : '#10b981' }}>{backlogs}</div>
                </div>
            </div>

            {/* Future Target Optimizer (AI Goal Advisor) */}
            <div style={{ marginTop: '10px' }}>
                <AiGoalAdvisor data={data} />
            </div>
            <ReportFooter />
        </div>
    );
};

const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '25px'
};

const statBoxStyle = {
    background: 'var(--bg-dark)',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    textAlign: 'center'
};

const statLabelStyle = {
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    marginBottom: '5px'
};

const statValueStyle = {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--primary)'
};

const cardStyle = {
    background: 'rgba(255,255,255,0.02)',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid var(--border)'
};

const cardTitleStyle = {
    color: 'var(--text-primary)',
    marginBottom: '20px',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
};

const dotStyle = (color) => ({
    display: 'block',
    width: '4px',
    height: '16px',
    background: color,
    borderRadius: '2px'
});

const focusGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px'
};

const focusItemStyle = {
    background: 'var(--bg-dark)',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.05)'
};

export default AnalysisDashboard;
