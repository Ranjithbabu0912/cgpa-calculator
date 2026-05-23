import React from 'react';

const ReportPrintView = ({ data, registerNo }) => {
    if (!data) return null;

    return (
        <div className="print-report-container" style={containerStyle}>
            {/* College Header */}
            <div style={headerSectionStyle}>
                <div style={logoWrapperStyle}>
                    <img src="/logo.png" alt="Logo" style={logoStyle} />
                </div>
                <div style={headerTextStyle}>
                    <h1 style={collegeNameStyle}>G.T.N. Arts College (Autonomous)</h1>
                    <div style={addressStyle}>Dindigul - 624 005</div>
                    <div style={accreditationStyle}>
                        Affiliated to Madurai Kamaraj University || Re-Accredited by NAAC with 'A++' Grade (Cycle-2)
                    </div>
                    <div style={officeStyle}>OFFICE OF THE CONTROLLER OF EXAMINATIONS</div>
                    <div style={yearStyle}>(Academic Year : JUN 2025-APR 2026)</div>
                    <div style={examNameStyle}>End Semester Examination Results (NOVEMBER - 2025-SSP)</div>
                </div>
            </div>

            {/* Content Border Box */}
            <div style={contentBoxStyle}>
                {/* Student Info Row */}
                <div style={studentInfoRowStyle}>
                    <div style={infoListStyle}>
                        <table style={infoTableStyle}>
                            <tbody>
                                <tr><td style={labelStyle}>Register Number</td><td>:</td><td style={valueStyle}>{registerNo}</td></tr>
                                <tr><td style={labelStyle}>Name</td><td>:</td><td style={valueStyle}>{data.student}</td></tr>
                                <tr><td style={labelStyle}>Department</td><td>:</td><td style={valueStyle}>{data.department}</td></tr>
                                <tr><td style={labelStyle}>Batch</td><td>:</td><td style={valueStyle}>{data.batch}</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div style={photoWrapperStyle}>
                        <img
                            src={data.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.student)}`}
                            alt="Student"
                            style={photoStyle}
                        />
                    </div>
                </div>

                {/* Results Table */}
                <table style={resultsTableStyle}>
                    <thead>
                        <tr>
                            <th style={thStylePrint} rowSpan="2">Sno.</th>
                            <th style={thStylePrint} rowSpan="2">Semester</th>
                            <th style={thStylePrint} colSpan="2">Subject</th>
                            <th style={thStylePrint} rowSpan="2">CIA</th>
                            <th style={thStylePrint} rowSpan="2">CE</th>
                            <th style={thStylePrint} rowSpan="2">Total</th>
                            <th style={thStylePrint} rowSpan="2">Status</th>
                        </tr>
                        <tr>
                            <th style={{ ...thStylePrint, borderTop: '1px solid #333' }}>Code</th>
                            <th style={{ ...thStylePrint, borderTop: '1px solid #333' }}>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.results.map((r, i) => (
                            <tr key={i}>
                                <td style={tdStyle}>{i + 1}</td>
                                <td style={tdStyle}>{r.semester}</td>
                                <td style={tdStyle}>{r.subjectCode}</td>
                                <td style={{ ...tdStyle, textAlign: 'left' }}>{r.subjectName}</td>
                                <td style={tdStyle}>{r.internalMarks}</td>
                                <td style={tdStyle}>{r.externalMarks}</td>
                                <td style={tdStyle}>{r.totalMarks}</td>
                                <td style={tdStyle}>{r.totalMarks >= 40 ? 'Pass' : 'RA'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Legend & Summary */}
                <div style={legendRowStyle}>
                    <div style={{ flex: 1 }}>
                        <span>CIA: Internal Mark</span>
                        <span style={{ marginLeft: '20px' }}>CE: External Mark</span>
                    </div>
                    <div style={summaryStyle}>
                        <div>Total Credits: <strong>{data.totalCredits}</strong></div>
                        <div>CGPA: <strong>{data.cgpa}</strong></div>
                    </div>
                </div>
            </div>

            {/* Signature Section */}
            <div style={signatureRowStyle}>
                {/* <div style={sigBoxStyle}>
                    <div style={sigLineStyle}></div>
                    <div>Student Signature</div>
                </div> */}
                <div style={sigBoxStyle}>
                    <div style={sigLineStyle}></div>
                    <div>Student Signature</div>
                </div>
            </div>
        </div>
    );
};

// Styles to match the image exactly
const containerStyle = {
    fontFamily: '"Arial", sans-serif',
    color: '#000',
    padding: '20px',
    backgroundColor: '#fff',
    lineHeight: '1.4'
};

const headerSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '2px solid #000',
    paddingBottom: '10px'
};

const logoWrapperStyle = { width: '100px', flexShrink: 0 };
const logoStyle = { width: '100%', height: 'auto' };

const headerTextStyle = {
    flexGrow: 1,
    textAlign: 'center'
};

const collegeNameStyle = { margin: 0, fontSize: '20pt', fontWeight: 'bold' };
const addressStyle = { fontSize: '12pt', fontWeight: 'bold' };
const accreditationStyle = { fontSize: '8pt', fontWeight: 'bold', margin: '5px 0' };
const officeStyle = { fontSize: '11pt', fontWeight: 'bold', textDecoration: 'underline' };
const yearStyle = { fontSize: '10pt', fontWeight: 'bold' };
const examNameStyle = { fontSize: '10pt', fontWeight: 'bold', marginTop: '5px' };

const contentBoxStyle = {
    border: '2px solid #3b82f6',
    borderRadius: '15px',
    padding: '20px',
    minHeight: '600px'
};

const studentInfoRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px'
};

const infoListStyle = { flex: 1 };
const infoTableStyle = { borderCollapse: 'collapse', width: '100%', fontSize: '11pt' };
const labelStyle = { width: '150px', fontWeight: 'bold', padding: '4px 0' };
const valueStyle = { padding: '4px 10px', fontWeight: 'bold' };

const photoWrapperStyle = {
    width: '120px',
    height: '140px',
    border: '1px solid #ddd',
    padding: '2px'
};
const photoStyle = { width: '100%', height: '100%', objectFit: 'cover' };

const resultsTableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '10pt',
    textAlign: 'center',
    marginTop: '10px'
};

const thStylePrint = {
    border: '1px solid #333',
    padding: '10px 5px',
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold'
};

const tdStyle = {
    border: '1px solid #333',
    padding: '8px 5px',
    color: '#000'
};

const legendRowStyle = {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10pt',
    fontWeight: 'bold'
};

const summaryStyle = {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
};

const signatureRowStyle = {
    marginTop: '60px',
    display: 'flex',
    justifyContent: 'end',
    padding: '0 20px'
};

const sigBoxStyle = {
    textAlign: 'center',
    width: '200px',
    fontSize: '10pt',
    fontWeight: 'bold'
};

const sigLineStyle = {
    borderTop: '1px solid #000',
    marginBottom: '8px'
};

// Global styles for print
const printStyles = `
@media print {
    body * { visibility: hidden; }
    .print-report-container, .print-report-container * { visibility: visible; }
    .print-report-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
    }
    .no-print { display: none !important; }
}
`;

export default ReportPrintView;
