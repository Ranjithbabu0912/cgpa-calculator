import React from 'react';

const StudentProfile = ({ data, registerNo }) => {
    if (!data) return null;

    return (
        <div className="student-profile glass-card">
            <div className="profile-info" style={{ flex: 1 }}>
                <table className="info-table">
                    <tbody>
                        <tr>
                            <td className="info-label" style={labelStyle}>Register Number</td>
                            <td style={colonStyle}>:</td>
                            <td style={valueStyle}>{registerNo}</td>
                        </tr>
                        <tr>
                            <td className="info-label" style={labelStyle}>Name</td>
                            <td style={colonStyle}>:</td>
                            <td style={valueStyle}>{data.student}</td>
                        </tr>
                        <tr>
                            <td className="info-label" style={labelStyle}>Department</td>
                            <td style={colonStyle}>:</td>
                            <td style={valueStyle}>{data.department}</td>
                        </tr>
                        <tr>
                            <td className="info-label" style={labelStyle}>Batch</td>
                            <td style={colonStyle}>:</td>
                            <td style={valueStyle}>{data.batch}</td>
                        </tr>
                        <tr>
                            <td className="info-label" style={labelStyle}>Status</td>
                            <td style={colonStyle}>:</td>
                            <td style={valueStyle}>
                                 <span style={{
                                     color: data.results?.some(r => r.status === 'Fail' && r.isResultHolded !== 'Y' && r.resultStatus !== 'With Held') 
                                         ? 'var(--danger)' 
                                         : data.results?.some(r => r.isResultHolded === 'Y' || r.resultStatus === 'With Held') 
                                             ? 'var(--warning)' 
                                             : '#10b981',
                                     fontWeight: 'bold'
                                 }}>
                                     {data.results?.some(r => r.status === 'Fail' && r.isResultHolded !== 'Y' && r.resultStatus !== 'With Held') 
                                         ? 'BACKLOGS FOUND' 
                                         : data.results?.some(r => r.isResultHolded === 'Y' || r.resultStatus === 'With Held') 
                                             ? 'ALL PASS (WITHHELD DUE TO PENDING DUES)' 
                                             : 'ALL PASS'}
                                 </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="profile-photo-container" style={{
                width: '140px',
                height: '170px',
                border: '1px solid var(--border)',
                background: 'var(--bg-dark)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                borderRadius: '4px'
            }}>
                <img
                    src={data.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.student)}&background=6366f1&color=fff&size=120`}
                    alt="Student Photo"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        background: '#fff'
                    }}
                />
            </div>
        </div>
    );
};

const labelStyle = {
    padding: '8px 0',
    fontSize: '1.1rem',
    fontWeight: '600',
    width: '150px',
    color: 'var(--text-secondary)',
    verticalAlign: 'top'
};

const colonStyle = {
    padding: '8px 0',
    fontSize: '1.1rem',
    width: '30px',
    textAlign: 'center',
    fontWeight: '600'
};

const valueStyle = {
    padding: '8px 0',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    verticalAlign: 'top'
};

export default StudentProfile;
