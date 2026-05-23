import React from 'react';

const AnalysisDashboard = ({ data }) => {
    if (!data || !data.results) return null;

    const avgMarks = (
        data.results.reduce(
            (sum, r) => sum + r.totalMarks,
            0
        ) / data.results.length
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
        [...data.results].sort(

            (a, b) =>

                gradesOrder.indexOf(a.grade) -
                gradesOrder.indexOf(b.grade)
        );

    const highestGrade =
        sortedResults[0]?.grade || '-';

    const backlogs =
        data.results.filter(

            r =>
                r.grade === 'U' ||
                r.grade === 'RA' ||
                r.grade === 'F' ||
                r.grade === 'AB'

        ).length;

    const gradeDistribution = {};
    data.results.forEach(r => {
        gradeDistribution[r.grade] = (gradeDistribution[r.grade] || 0) + 1;
    });

    const sortedGrades = Object.entries(gradeDistribution).sort((a, b) => gradesOrder.indexOf(a[0]) - gradesOrder.indexOf(b[0]));

    const cgpa = parseFloat(data.cgpa);
    let insightColor = '#10b981';
    let insightMsg = '';
    let insightIcon = '✨';

    if (cgpa >= 9) {
        insightMsg = 'Outstanding! Your CGPA is among the top tier.';
        insightColor = '#10b981';
        insightIcon = '👑';
    } else if (cgpa >= 8) {
        insightMsg = 'Great Performance! Focus on difficult subjects to hit O.';
        insightColor = '#6366f1';
        insightIcon = '🌟';
    } else if (cgpa >= 7) {
        insightMsg = 'Good Work! Your results are solid and consistent.';
        insightColor = '#3b82f6';
        insightIcon = '👍';
    } else {
        insightMsg = 'Satisfactory. There is room for improvement in core areas.';
        insightColor = '#f59e0b';
        insightIcon = '📚';
    }

    const semTrend = data.sgpa.length > 1 ?
        (parseFloat(data.sgpa[data.sgpa.length - 1].sgpa) >= parseFloat(data.sgpa[0].sgpa) ? 'Positive' : 'Declining') :
        'Stable';
    const trendColor = semTrend === 'Positive' ? '#10b981' : (semTrend === 'Stable' ? '#6366f1' : '#ef4444');

    return (
        <div className="analysis-dashboard">
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

            <div style={mainGridStyle}>
                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>
                        <span style={dotStyle('var(--primary)')}></span> Grade Distribution
                    </h3>
                    {sortedGrades.map(([grade, count]) => {
                        const percentage = ((count / data.results.length) * 100).toFixed(0);
                        return (
                            <div key={grade} style={{ marginBottom: '15px' }}>
                                <div style={distHeaderStyle}>
                                    <span style={{ fontWeight: 600 }}>Grade {grade}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{count} Subjects ({percentage}%)</span>
                                </div>
                                <div style={progressBgStyle}>
                                    <div style={progressBarStyle(percentage)}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={cardStyle}>
                    <h3 style={{ ...cardTitleStyle, color: '#fbbf24' }}>
                        <span style={dotStyle('#fbbf24')}></span> Performance Insights
                    </h3>
                    <div style={insightBoxStyle(insightColor)}>
                        <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{insightIcon} Overall Standing</div>
                        <div style={insightTextStyle}>{insightMsg}</div>
                    </div>
                    <div style={insightBoxStyle(trendColor)}>
                        <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>📈 Semester Trend</div>
                        <div style={insightTextStyle}>Your progress is <strong>{semTrend}</strong>.</div>
                    </div>
                </div>
            </div>

            <div style={focusAreaStyle}>
                <h3 style={{ color: '#fca5a5', marginBottom: '15px', fontSize: '1rem' }}>🎯 Focus Areas (Needs Improvement)</h3>
                <div style={focusGridStyle}>
                    {data.results.filter(r => ['B', 'C', 'RA', 'F'].includes(r.grade)).map(r => (
                        <div key={r.subjectCode} style={focusItemStyle}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.subjectName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Grade: <span style={{ color: r.status === 'Fail' ? '#ef4444' : '#f59e0b', fontWeight: 'bold' }}>{r.grade}</span> | Marks: {r.totalMarks}
                            </div>
                        </div>
                    ))}
                    {data.results.filter(r => ['B', 'C', 'RA', 'F'].includes(r.grade)).length === 0 && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Excellent consistency! No subjects require attention.</p>
                    )}
                </div>
            </div>
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

const mainGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '25px'
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

const distHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '0.85rem'
};

const progressBgStyle = {
    background: 'var(--bg-dark)',
    borderRadius: '10px',
    overflow: 'hidden',
    height: '10px',
    border: '1px solid rgba(255,255,255,0.05)'
};

const progressBarStyle = (percentage) => ({
    background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
    width: `${percentage}%`,
    height: '100%',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)'
});

const insightBoxStyle = (color) => ({
    background: 'var(--bg-dark)',
    padding: '15px',
    borderRadius: '12px',
    borderLeft: `4px solid ${color}`,
    marginBottom: '15px'
});

const insightTextStyle = {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5'
};

const focusAreaStyle = {
    marginTop: '25px',
    padding: '20px',
    background: 'rgba(239, 68, 68, 0.05)',
    borderRadius: '16px',
    border: '1px solid rgba(239, 68, 68, 0.2)'
};

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
