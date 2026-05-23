import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Printer, Copy, LayoutDashboard, Table as TableIcon, Activity, GraduationCap, ChevronRight, ArchiveRestore } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentProfile from './components/StudentProfile';
import AnalysisDashboard from './components/AnalysisDashboard';
import ReportFooter from './components/ReportFooter';
import ReportPrintView from './components/ReportPrintView';
import ManualMarksManager from './components/ManualMarksManager';

const API_URL = 'http://localhost:5000';

function App() {
    const [registerNo, setRegisterNo] = useState('');
    const [dob, setDob] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('sgpa');
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        const savedData = localStorage.getItem('lastResults');
        const savedReg = localStorage.getItem('lastRegNo');
        const savedDob = localStorage.getItem('lastDob');

        if (savedData) setData(JSON.parse(savedData));
        if (savedReg) setRegisterNo(savedReg);
        if (savedDob) setDob(savedDob);
    }, []);

    const formatDob = (value) => {
        let clean = value.replace(/\D/g, '');
        if (clean.length <= 2) return clean;
        if (clean.length <= 4) return clean.slice(0, 2) + '-' + clean.slice(2);
        return clean.slice(0, 2) + '-' + clean.slice(2, 4) + '-' + clean.slice(4, 8);
    };

    const handleFetch = async (e) => {
        e.preventDefault();
        if (!registerNo || !dob) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');
        setData(null); // Clear previous student data immediately

        try {
            const response = await fetch(`${API_URL}/api/fetch-results`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registerNo, dob }),
            });

            const result = await response.json();

            if (result.success) {
                setData(result);
                localStorage.setItem('lastResults', JSON.stringify(result));
                localStorage.setItem('lastRegNo', registerNo);
                localStorage.setItem('lastDob', dob);
            } else {
                setError(result.message || 'Failed to fetch results');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            if (err.name === 'AbortError') {
                setError('Request timed out. The college portal is responding too slowly.');
            } else {
                setError('Connection failed. Please ensure the backend server is running and the college portal is accessible.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setData(null);
        setRegisterNo('');
        setDob('');
        localStorage.removeItem('lastResults');
        localStorage.removeItem('lastRegNo');
        localStorage.removeItem('lastDob');
    };

    const handleDownload = () => {
        window.print();
    };

    return (
        <>
            <div className="container">
                {/* Ambient Background Circles */}
                <div className="no-print" style={{ position: 'fixed', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)', zIndex: -1 }}></div>
                <div className="no-print" style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)', zIndex: -1 }}></div>

                <header className="no-print" style={headerStyle}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <h1 style={titleStyle}><GraduationCap size={48} style={{ verticalAlign: 'middle', marginRight: '15px', color: 'var(--primary)' }} />CGPA Therinjiko</h1>
                        <p style={subtitleStyle}>Between B(birth) and D(death) there is C <br />C for CGPA.</p>
                    </motion.div>
                </header>

                <motion.div
                    layout
                    className="form-section glass-card no-print"
                    style={formSectionStyle}
                >
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={errorStyle}>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleFetch}>
                        <div style={formGridStyle}>
                            <div className="form-group">
                                <label style={labelStyle}>Register Number</label>
                                <input
                                    type="text"
                                    value={registerNo}
                                    onChange={(e) => setRegisterNo(e.target.value.toUpperCase())}
                                    placeholder="e.g., 25PCAA027"
                                    style={inputStyle}
                                />
                            </div>
                            <div className="form-group">
                                <label style={labelStyle}>Date of Birth</label>
                                <input
                                    type="text"
                                    value={dob}
                                    onChange={(e) => setDob(formatDob(e.target.value))}
                                    placeholder="DD-MM-YYYY"
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div style={btnGroupStyle}>
                            <button type="submit" disabled={loading} style={primaryBtnStyle}>
                                {loading ? <span className="btn-spinner"></span> : <><Search size={20} /> Analyze Data</>}
                            </button>
                            <button type="button" onClick={handleReset} style={secondaryBtnStyle}>
                                <RotateCcw size={20} /> Reset
                            </button>
                        </div>
                    </form>
                </motion.div>

                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="full-page-loader no-print"
                        >
                            <div className="spinner"></div>
                            <div style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '1px' }}>ANALYZING ACADEMIC DATA...</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '10px' }}>This may take up to 60 seconds if the college portal is slow</div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {data && (
                    <div className="results-section">
                        <StudentProfile data={data} registerNo={registerNo} />

                        <div className="no-print cgpa-container" style={cgpaContainerStyle}>
                            <div className="glass-card" style={cgpaCardStyle}>
                                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' }}>OVERALL CGPA</div>
                                <div style={{ fontSize: '4.5rem', fontWeight: 800, margin: '10px 0', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{data.cgpa}</div>
                                <div style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', display: 'inline-block', fontSize: '0.8rem' }}>10.0 Scale</div>
                            </div>
                            <div className="side-stats" style={sideStatsStyle}>
                                <div className="glass-card" style={miniStatStyle}>
                                    <div style={miniLabelStyle}>Total Semesters</div>
                                    <div style={miniValueStyle}>{data.sgpa?.length}</div>
                                </div>
                                <div className="glass-card" style={miniStatStyle}>
                                    <div style={miniLabelStyle}>Total Credits</div>
                                    <div style={miniValueStyle}>{data.totalCredits}</div>
                                </div>
                            </div>
                        </div>

                        <div className="tabs no-print" style={tabsStyle}>
                            {['sgpa', 'results', 'analysis'].map(tab => (
                                <button
                                    key={tab}
                                    className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === 'sgpa' && <LayoutDashboard size={18} />}
                                    {tab === 'results' && <TableIcon size={18} />}
                                    {tab === 'analysis' && <Activity size={18} />}
                                    {/* {tab === 'manual' && <ArchiveRestore size={18} />} */}
                                    {tab.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        <div className="tab-content" style={{ marginTop: '30px' }}>
                            {activeTab === 'sgpa' && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={sgpaGridStyle}>
                                    {data.sgpa.map(sem => (
                                        <div key={sem.semester} className="glass-card" style={sgpaCardStyleItem}>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Semester {sem.semester}</div>
                                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '10px' }}>{sem.sgpa}</div>
                                            <div style={{ height: '4px', width: '40px', background: 'var(--primary)', margin: '15px auto 0', borderRadius: '2px' }}></div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {activeTab === 'results' && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="table-container">
                                    <table className="results-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={thStyle}>S.No</th>
                                                <th style={thStyle}>Sem</th>
                                                <th style={thStyle}>Subject Details</th>
                                                <th style={thStyle}>CIA / CE</th>
                                                <th style={thStyle}>Total</th>
                                                <th style={thStyle}>Grade</th>
                                                <th style={thStyle}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.results.map((r, i) => (
                                                <tr key={i}>
                                                    <td style={tdStyle}>{i + 1}</td>
                                                    <td style={tdStyle}>{r.semester}</td>
                                                    <td style={tdStyle}>
                                                        <div style={{ fontWeight: 600 }}>{r.subjectName}</div>
                                                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{r.subjectCode}</div>
                                                    </td>
                                                    <td style={tdStyle}>{r.internalMarks} / {r.externalMarks}</td>
                                                    <td style={tdStyle}>{r.totalMarks}</td>
                                                    <td style={tdStyle}>
                                                        <span style={gradeBadgeStyle(r.grade)}>{r.grade}</span>
                                                    </td>
                                                    <td style={tdStyle}>{r.status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </motion.div>
                            )}

                            {activeTab === 'analysis' && <div className="no-print"><AnalysisDashboard data={data} /></div>}

                            {/* {activeTab === 'manual' && (
                                <div>
                                    <ManualMarksManager
                                        registerNo={registerNo}
                                        studentName={data.student}
                                    />
                                </div>
                            )} */}

                        </div>

                        <div className="no-print action-buttons" style={actionButtonsStyle}>
                            <button style={primaryBtnActionStyle} onClick={() => setShowPreview(true)}>
                                <Activity size={20} /> Preview Report
                            </button>
                            <button style={secondaryBtnActionStyle} onClick={handleDownload}>
                                <Printer size={20} /> Print PDF
                            </button>
                        </div>

                        <AnimatePresence>
                            {showPreview && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="no-print"
                                    style={modalOverlayStyle}
                                    onClick={() => setShowPreview(false)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.9, y: 20 }}
                                        style={modalContentStyle}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div style={modalHeaderStyle}>
                                            <h3 style={{ margin: 0 }}>Report Preview</h3>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={handleDownload} style={printBtnStyle}>
                                                    <Printer size={16} /> Print Now
                                                </button>
                                                <button onClick={() => setShowPreview(false)} style={closeBtnStyle}>✕</button>
                                            </div>
                                        </div>
                                        <div style={modalBodyStyle}>
                                            <ReportPrintView data={data} registerNo={registerNo} />
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <ReportFooter />
                    </div>
                )}
            </div>

            {/* OFFICIAL PRINT VIEW (OUTSIDE CONTAINER TO AVOID NESTED DISPLAY:NONE) */}
            {data && (
                <div className="print-only-container">
                    <ReportPrintView data={data} registerNo={registerNo} />
                </div>
            )}
        </>
    );
}

// Updated Styles
const headerStyle = { textAlign: 'center', marginBottom: '50px' };
const titleStyle = { fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: '10px' };
const subtitleStyle = { color: 'var(--text-secondary)', fontSize: '1.2rem', letterSpacing: '1px' };
const formSectionStyle = { padding: '40px', marginBottom: '50px' };
const formGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '30px' };
const labelStyle = { display: 'block', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' };
const inputStyle = { width: '100%', padding: '16px 20px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', fontSize: '1rem', transition: 'all 0.3s' };
const btnGroupStyle = { display: 'flex', gap: '20px' };
const primaryBtnStyle = { flex: 2, padding: '16px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontWeight: 700, fontSize: '1rem', transition: 'all 0.3s' };
const secondaryBtnStyle = { flex: 1, padding: '16px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 600 };
const errorStyle = { background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '15px', borderRadius: '12px', marginBottom: '25px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem' };

const cgpaContainerStyle = { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '25px', marginBottom: '40px' };
const cgpaCardStyle = { padding: '50px 30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
const sideStatsStyle = { display: 'grid', gridTemplateRows: '1fr 1fr', gap: '20px' };
const miniStatStyle = { padding: '25px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' };
const miniLabelStyle = { fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' };
const miniValueStyle = { fontSize: '2.5rem', fontWeight: 800 };

const tabsStyle = { display: 'flex', gap: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '0', overflowX: 'auto' };
const sgpaGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' };
const sgpaCardStyleItem = { padding: '30px', textAlign: 'center' };

const thStyle = { padding: '18px 20px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px' };
const tdStyle = { padding: '18px 20px', fontSize: '0.95rem', borderBottom: '1px solid rgba(255,255,255,0.03)' };
const gradeBadgeStyle = (grade) => {
    const colors = {

        'O+': '#22c55e',
        'O': '#16a34a',

        'D++': '#06b6d4',
        'D+': '#0ea5e9',
        'D': '#3b82f6',

        'A++': '#6366f1',
        'A+': '#8b5cf6',
        'A': '#a855f7',

        'B+': '#f59e0b',
        'B': '#f97316',

        'C+': '#eab308',
        'C': '#94a3b8',

        'U': '#ef4444'
    };
    const color = colors[grade] || 'var(--primary)';
    return { padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, background: `${color}15`, color: color, border: `1px solid ${color}30` };
};

const actionButtonsStyle = { display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '50px' };
const primaryBtnActionStyle = { padding: '16px 35px', background: 'white', color: 'black', border: 'none', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800, fontSize: '1rem', transition: 'all 0.3s' };
const secondaryBtnActionStyle = { padding: '16px 30px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 };

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' };
const modalContentStyle = { background: 'white', width: '100%', maxWidth: '900px', maxHeight: '90vh', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', color: 'black' };
const modalHeaderStyle = { padding: '20px 30px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' };
const modalBodyStyle = { padding: '30px', overflowY: 'auto', flex: 1, background: '#fff' };
const printBtnStyle = { padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem' };
const closeBtnStyle = { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' };

export default App;
