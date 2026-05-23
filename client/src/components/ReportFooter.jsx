import React from 'react';

const ReportFooter = () => (
    <div className="report-footer" style={{
        marginTop: '40px',
        paddingTop: '30px',
        borderTop: '2px dashed var(--border)',
        color: 'var(--text-secondary)'
    }}>
        <div className="formula-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
        }}>
            <div className="formula-box">
                <h4 style={footerTitleStyle}>Calculation Formula</h4>
                <p style={pStyle}><strong>1. Grade Point (GP):</strong> Total Marks / 10</p>
                <div style={codeBoxStyle}>GP = Total Marks / 10</div>
                <p style={pStyle}><strong>2. Weighted Grade Points (WGP):</strong> GP × Credits</p>
                <div style={codeBoxStyle}>WGP = GP × Credits</div>
                <p style={pStyle}><strong>3. SGPA / CGPA:</strong> Σ(WGP) / Σ(Credits)</p>
                <div style={codeBoxStyle}>SGPA/CGPA = Σ(WGP) / Σ(Credits)</div>
            </div>
            <div className="formula-box">
                <h4 style={footerTitleStyle}>Grading System</h4>
                <table style={gradeTableStyle}>
                    <tbody>
                        <tr>
                            <td>95 - 100</td>
                            <td style={gCellStyle}>O+</td>
                            <td>Exceptional</td>
                        </tr>

                        <tr>
                            <td>90 - 94</td>
                            <td style={gCellStyle}>O</td>
                            <td>Outstanding</td>
                        </tr>

                        <tr>
                            <td>85 - 89</td>
                            <td style={gCellStyle}>D++</td>
                            <td>Distinction Plus Plus</td>
                        </tr>

                        <tr>
                            <td>80 - 84</td>
                            <td style={gCellStyle}>D+</td>
                            <td>Distinction Plus</td>
                        </tr>

                        <tr>
                            <td>75 - 79</td>
                            <td style={gCellStyle}>D</td>
                            <td>Distinction</td>
                        </tr>

                        <tr>
                            <td>70 - 74</td>
                            <td style={gCellStyle}>A++</td>
                            <td>Excellent</td>
                        </tr>

                        <tr>
                            <td>65 - 69</td>
                            <td style={gCellStyle}>A+</td>
                            <td>Very Good</td>
                        </tr>

                        <tr>
                            <td>60 - 64</td>
                            <td style={gCellStyle}>A</td>
                            <td>Good</td>
                        </tr>

                        <tr>
                            <td>55 - 59</td>
                            <td style={gCellStyle}>B+</td>
                            <td>Above Average</td>
                        </tr>

                        <tr>
                            <td>50 - 54</td>
                            <td style={gCellStyle}>B</td>
                            <td>Average</td>
                        </tr>

                        <tr>
                            <td>45 - 49</td>
                            <td style={gCellStyle}>C+</td>
                            <td>Pass Plus</td>
                        </tr>

                        <tr>
                            <td>40 - 44</td>
                            <td style={gCellStyle}>C</td>
                            <td>Pass</td>
                        </tr>

                        <tr>
                            <td>0 - 39</td>
                            <td style={gCellStyle}>U</td>
                            <td>Re-Appearance</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const footerTitleStyle = {
    color: 'var(--primary)',
    marginBottom: '15px',
    fontSize: '1.1rem',
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

const pStyle = {
    fontSize: '0.9rem',
    lineHeight: '1.6',
    marginBottom: '10px'
};

const codeBoxStyle = {
    background: 'var(--bg-dark)',
    padding: '10px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    borderLeft: '3px solid var(--primary)',
    marginBottom: '15px',
    fontSize: '0.85rem'
};

const gradeTableStyle = {
    width: '100%',
    fontSize: '0.85rem',
    borderCollapse: 'collapse'
};

const gCellStyle = {
    fontWeight: 'bold',
    color: 'var(--primary)',
    padding: '5px 10px'
};


export default ReportFooter;
