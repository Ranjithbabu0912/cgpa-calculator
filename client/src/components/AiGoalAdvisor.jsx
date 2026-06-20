import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, Calendar, BookOpen, Award, Brain, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://cgpa-backend-1wfh.onrender.com';

const AiGoalAdvisor = ({ data }) => {
    const [targetCgpa, setTargetCgpa] = useState(9.0);
    const [totalSemesters, setTotalSemesters] = useState(4);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [advisorData, setAdvisorData] = useState(null);
    const [error, setError] = useState('');

    const currentCgpa = parseFloat(data?.cgpa) || 0;
    const completedSemesters = data?.sgpa?.length || 0;
    const remainingSemesters = Math.max(0, totalSemesters - completedSemesters);
    const totalCredits = data?.totalCredits || 0;

    // Mathematical calculations
    let requiredSgpa = 0;
    let maxAchievableCgpa = currentCgpa;

    if (remainingSemesters > 0) {
        requiredSgpa = ((targetCgpa * totalSemesters) - (currentCgpa * completedSemesters)) / remainingSemesters;
        maxAchievableCgpa = ((currentCgpa * completedSemesters) + (10.0 * remainingSemesters)) / totalSemesters;
    }

    // Feasibility status mapping
    let feasibility = {
        label: 'Safe',
        color: 'var(--success)',
        bgColor: 'rgba(16, 185, 129, 0.08)',
        description: 'Highly achievable by maintaining your current standard.'
    };

    if (remainingSemesters === 0) {
        feasibility = {
            label: 'Locked',
            color: 'var(--text-secondary)',
            bgColor: 'rgba(148, 163, 184, 0.08)',
            description: 'Course is completed. Your CGPA is locked.'
        };
    } else if (requiredSgpa > 10.0) {
        feasibility = {
            label: 'Impossible',
            color: 'var(--danger)',
            bgColor: 'rgba(239, 68, 68, 0.08)',
            description: `Requires average SGPA of ${requiredSgpa.toFixed(2)}. Max possible is ${maxAchievableCgpa.toFixed(2)}.`
        };
    } else if (requiredSgpa >= 9.0) {
        feasibility = {
            label: 'Challenging',
            color: 'var(--warning)',
            bgColor: 'rgba(245, 158, 11, 0.08)',
            description: `Requires near-perfect scores (${requiredSgpa.toFixed(2)} average SGPA).`
        };
    } else if (requiredSgpa >= 8.0) {
        feasibility = {
            label: 'Moderate',
            color: '#818cf8',
            bgColor: 'rgba(129, 140, 248, 0.08)',
            description: `Requires average SGPA of ${requiredSgpa.toFixed(2)}.`
        };
    }

    // SVG Circular Progress Calculations
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    // Cap target percentage between 0 and 100
    const targetPercentage = targetCgpa > 0 ? Math.min(100, Math.max(0, (currentCgpa / targetCgpa) * 100)) : 0;
    const strokeDashoffset = circumference - (targetPercentage / 100) * circumference;

    // Fast target updates
    const adjustTarget = (amount) => {
        setTargetCgpa(prev => {
            const next = prev + amount;
            return parseFloat(Math.min(10.0, Math.max(4.0, next)).toFixed(2));
        });
    };

    // Cycle messages for loading
    useEffect(() => {
        if (!loading) return;
        const messages = [
            'Analyzing current results...',
            'Calculating required credit weightages...',
            'Evaluating backlog courses...',
            'Generating custom semester milestones...',
            'Synthesizing optimal study strategies...'
        ];
        let index = 0;
        setLoadingMessage(messages[0]);
        const interval = setInterval(() => {
            index = (index + 1) % messages.length;
            setLoadingMessage(messages[index]);
        }, 1600);
        return () => clearInterval(interval);
    }, [loading]);

    const fetchAiPlan = async () => {
        setLoading(true);
        setError('');
        setAdvisorData(null);

        try {
            const response = await fetch(`${API_URL}/api/ai-analysis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentName: data.student,
                    currentCgpa: currentCgpa.toString(),
                    totalCredits,
                    results: data.results,
                    targetCgpa,
                    totalSemesters
                })
            });

            const result = await response.json();
            if (result.success) {
                setAdvisorData(result);
            } else {
                setError(result.error || 'Failed to fetch advisor details');
            }
        } catch (err) {
            console.error('Advisor fetch error:', err);
            setError('Connection to backend failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-goal-advisor">
            <h3 style={sectionTitleStyle} className="no-print">
                <Brain size={20} style={{ color: 'var(--primary)', verticalAlign: 'middle', marginRight: '8px' }} />
                AI Goal Advisor & Target Optimizer
            </h3>

            {/* Redesigned settings panel */}
            <div className="glass-card no-print" style={settingsCardStyle}>
                <div className="ai-advisor-setup-grid">
                    
                    {/* Left Pane: Snappy Controls */}
                    <div style={leftControlsPaneStyle}>
                        <div style={inputContainerStyle}>
                            <label style={inputLabelStyle}>Target CGPA</label>
                            <div style={targetAdjusterStyle}>
                                <button type="button" onClick={() => adjustTarget(-0.1)} className="target-adjust-btn">-</button>
                                <span style={targetValueBigStyle}>{targetCgpa.toFixed(2)}</span>
                                <button type="button" onClick={() => adjustTarget(0.1)} className="target-adjust-btn">+</button>
                            </div>
                            <div style={presetGroupStyle}>
                                {[8.0, 8.5, 9.0, 9.5].map(preset => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => setTargetCgpa(preset)}
                                        className={`target-preset-btn ${targetCgpa === preset ? 'active' : ''}`}
                                    >
                                        {preset.toFixed(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={inputContainerStyle}>
                            <label style={inputLabelStyle}>Course Duration</label>
                            <select
                                value={totalSemesters}
                                onChange={(e) => setTotalSemesters(parseInt(e.target.value))}
                                style={selectStyle}
                            >
                                <option value={2}>2 Semesters (1 Year PG)</option>
                                <option value={4}>4 Semesters (2 Years MCA/M.Sc)</option>
                                <option value={6}>6 Semesters (3 Years UG)</option>
                                <option value={8}>8 Semesters (4 Years Tech/UG)</option>
                                <option value={10}>10 Semesters (5 Years Integrated)</option>
                            </select>
                        </div>
                    </div>

                    {/* Right Pane: Visual SVG Gauge & Math metrics */}
                    <div style={rightVisualPaneStyle}>
                        <div style={gaugeRowStyle}>
                            <div style={circularProgressWrapperStyle}>
                                <svg width="90" height="90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r={radius} stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="none" />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r={radius}
                                        stroke="var(--primary)"
                                        strokeWidth="6"
                                        fill="none"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        style={{
                                            transition: 'stroke-dashoffset 0.4s ease-out',
                                            transform: 'rotate(-90deg)',
                                            transformOrigin: '50% 50%'
                                        }}
                                    />
                                </svg>
                                <div style={gaugeCenterTextStyle}>
                                    <div style={gaugePercentStyle}>{targetPercentage.toFixed(0)}%</div>
                                    <div style={gaugeSubStyle}>Achieved</div>
                                </div>
                            </div>

                            <div style={mathKpiListStyle}>
                                <div style={kpiBoxStyle}>
                                    <div style={kpiLabelStyle}>Required SGPA</div>
                                    <div style={{ ...kpiValueStyle, color: feasibility.color }}>
                                        {remainingSemesters === 0 ? 'N/A' : (requiredSgpa > 10 ? '> 10.00' : requiredSgpa.toFixed(2))}
                                    </div>
                                </div>
                                <div style={kpiBoxStyle}>
                                    <div style={kpiLabelStyle}>Remaining Sems</div>
                                    <div style={kpiValueStyle}>{remainingSemesters}</div>
                                </div>
                            </div>
                        </div>

                        {/* Feasibility Alert Block */}
                        <div style={{ ...feasibilityBlockStyle, backgroundColor: feasibility.bgColor, borderColor: `${feasibility.color}25` }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {requiredSgpa > 10 ? (
                                    <AlertTriangle size={18} style={{ color: feasibility.color, flexShrink: 0 }} />
                                ) : (
                                    <CheckCircle size={18} style={{ color: feasibility.color, flexShrink: 0 }} />
                                )}
                                <div style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                                    <span style={{ fontWeight: 800, color: feasibility.color, textTransform: 'uppercase', marginRight: '5px' }}>
                                        {feasibility.label}:
                                    </span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{feasibility.description}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unified CTA button */}
                <button
                    onClick={fetchAiPlan}
                    disabled={loading}
                    style={aiBtnStyle}
                >
                    {loading ? (
                        <span className="btn-spinner"></span>
                    ) : (
                        <>
                            <Sparkles size={16} />
                            Generate AI Strategy Roadmap
                        </>
                    )}
                </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={errorStyle}
                        className="no-print"
                    >
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading skeleton */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={loadingContainerStyle}
                        className="no-print"
                    >
                        <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.05)', borderLeftColor: 'var(--primary)' }}></div>
                        <div style={loadingTextTitleStyle}>COMPILING ROADMAP</div>
                        <div style={loadingTextSubStyle}>{loadingMessage}</div>

                        <div style={skeletonGridStyle}>
                            <div style={skeletonCardStyle}></div>
                            <div style={skeletonCardStyle}></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Advisor Response Dashboard */}
            <AnimatePresence>
                {advisorData && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="ai-response-dashboard"
                        style={responseDashboardStyle}
                    >
                        {/* Summary Header */}
                        <div className="glass-card" style={summaryCardStyle}>
                            <div style={summaryHeaderStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Brain size={22} style={{ color: 'var(--primary)' }} />
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>AI Advisor Recommendations</h4>
                                </div>
                                <span style={sourceBadgeStyle(advisorData.source)}>
                                    {(advisorData.source === 'openai' || advisorData.source === 'gemini') ? '✨ AI-Powered' : '⚙️ Local System'}
                                </span>
                            </div>

                            <p style={summaryTextStyle}>{advisorData.summary}</p>

                            <div style={{ ...feasibilityBoxStyle, borderLeft: `4px solid ${feasibility.color}` }}>
                                <div style={{ fontWeight: 800, fontSize: '0.75rem', color: feasibility.color, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>
                                    Feasibility Assessment
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                                    {advisorData.feasibility}
                                </div>
                            </div>
                        </div>

                        {/* Milestones and subject Strategies */}
                        <div className="ai-response-dashboard-grid" style={responseGridStyle}>
                            {/* Semester Target Roadmap */}
                            <div className="glass-card" style={roadmapCardStyle}>
                                <h4 style={cardTitleStyle}>
                                    <Calendar size={16} style={{ color: 'var(--primary)' }} />
                                    Semester Milestones
                                </h4>
                                <div className="ai-advisor-timeline" style={timelineContainerStyle}>
                                    {advisorData.semesterRoadmap && advisorData.semesterRoadmap.length > 0 ? (
                                        advisorData.semesterRoadmap.map((item, idx) => (
                                            <div key={idx} style={timelineItemStyle}>
                                                <div style={timelineNodeStyle}>
                                                    <span>{item.semester}</span>
                                                </div>
                                                <div style={timelineContentStyle}>
                                                    <div style={timelineHeaderStyle}>
                                                        <span style={timelineTitleStyle}>Semester {item.semester} Target</span>
                                                        <span style={timelineTargetBadgeStyle}>{item.targetSgpa.toFixed(2)} SGPA</span>
                                                    </div>
                                                    <p style={timelineDescriptionStyle}>{item.focusAreas}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                                            No remaining semesters. Course completed!
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Weakness & Subject Strategies */}
                            <div className="glass-card" style={roadmapCardStyle}>
                                <h4 style={cardTitleStyle}>
                                    <BookOpen size={16} style={{ color: 'var(--primary)' }} />
                                    Subject-Specific Advice
                                </h4>
                                <div style={subjectListStyle}>
                                    {advisorData.subjectStrategies && advisorData.subjectStrategies.length > 0 ? (
                                        advisorData.subjectStrategies.map((subj, idx) => (
                                            <div key={idx} style={subjectItemStyle}>
                                                <div style={subjectHeaderStyle}>
                                                    <div style={subjectTitleContainerStyle}>
                                                        <span style={subjectNameStyle}>{subj.subjectName}</span>
                                                        <span style={subjectCodeStyle}>{subj.subjectCode}</span>
                                                    </div>
                                                    <span style={subjectGradeBadgeStyle(subj.currentGrade)}>
                                                        Grade: {subj.currentGrade}
                                                    </span>
                                                </div>
                                                <p style={subjectAdviceStyle}>{subj.strategy}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={emptySubjectsStyle}>
                                            <CheckCircle size={28} style={{ color: 'var(--success)', marginBottom: '10px' }} />
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Excellent Grades!</p>
                                            <p style={{ margin: '5px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                You have no low grades. Keep it up!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* General Productivity tips */}
                        <div className="glass-card" style={tipsCardStyle}>
                            <h4 style={cardTitleStyle}>
                                <Award size={16} style={{ color: '#fbbf24' }} />
                                Strategic Study Tips
                            </h4>
                            <ul style={tipsListStyle}>
                                {advisorData.generalTips && advisorData.generalTips.map((tip, idx) => (
                                    <li key={idx} style={tipsItemStyle}>
                                        <div style={tipsBulletStyle}>
                                            <ArrowRight size={12} style={{ color: 'var(--primary)' }} />
                                        </div>
                                        <span style={tipsTextStyle}>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Inline styles for the redesigned layout
const sectionTitleStyle = {
    fontSize: '1.15rem',
    fontWeight: 800,
    marginBottom: '15px',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
};

const settingsCardStyle = {
    padding: '24px',
    marginBottom: '25px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
};

const leftControlsPaneStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
};

const rightVisualPaneStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    justifyContent: 'space-between',
    height: '100%'
};

const inputContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
};

const inputLabelStyle = {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

const targetAdjusterStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '12px',
    padding: '6px',
    border: '1px solid var(--glass-border)',
    maxWidth: '220px'
};

const adjustBtnStyle = {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    outline: 'none'
};

const targetValueBigStyle = {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'white',
    letterSpacing: '0.5px'
};

const presetGroupStyle = {
    display: 'flex',
    gap: '8px',
    marginTop: '4px'
};

const presetBtnStyle = {
    flex: 1,
    padding: '8px 10px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none'
};

const presetActiveStyle = {
    ...presetBtnStyle,
    background: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'var(--primary)',
    color: 'white'
};

const selectStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s'
};

const gaugeRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    background: 'rgba(0, 0, 0, 0.15)',
    padding: '14px 16px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.02)'
};

const circularProgressWrapperStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
};

const gaugeCenterTextStyle = {
    position: 'absolute',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
};

const gaugePercentStyle = {
    fontSize: '1.1rem',
    fontWeight: 800,
    color: 'white',
    lineHeight: '1'
};

const gaugeSubStyle = {
    fontSize: '0.55rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '2px'
};

const mathKpiListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1
};

const kpiBoxStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    paddingBottom: '6px'
};

const kpiLabelStyle = {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const kpiValueStyle = {
    fontSize: '0.95rem',
    fontWeight: 800,
    color: 'white'
};

const feasibilityBlockStyle = {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid'
};

const aiBtnStyle = {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 700,
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
    marginTop: '5px'
};

const errorStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(239, 68, 68, 0.08)',
    color: 'var(--danger)',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    fontSize: '0.85rem',
    marginBottom: '20px'
};

const loadingContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 20px',
    background: 'rgba(15, 23, 42, 0.3)',
    borderRadius: '20px',
    border: '1px solid var(--glass-border)',
    textAlign: 'center',
    marginBottom: '25px'
};

const loadingTextTitleStyle = {
    fontSize: '0.9rem',
    fontWeight: 800,
    letterSpacing: '1px',
    marginTop: '10px',
    color: 'var(--text-primary)'
};

const loadingTextSubStyle = {
    color: 'var(--text-secondary)',
    fontSize: '0.75rem',
    marginTop: '4px',
    height: '18px'
};

const skeletonGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    width: '100%',
    maxWidth: '500px',
    marginTop: '25px'
};

const skeletonCardStyle = {
    height: '110px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite linear',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.02)'
};

const responseDashboardStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '20px'
};

const summaryCardStyle = {
    padding: '24px'
};

const summaryHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '12px'
};

const sourceBadgeStyle = (source) => {
    const isAi = source === 'openai' || source === 'gemini';
    return {
        padding: '4px 10px',
        borderRadius: '15px',
        fontSize: '0.7rem',
        fontWeight: 700,
        background: isAi ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.04)',
        color: isAi ? '#a5b4fc' : 'var(--text-secondary)',
        border: isAi ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(255,255,255,0.03)'
    };
};

const summaryTextStyle = {
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
    margin: '0 0 15px 0'
};

const feasibilityBoxStyle = {
    background: 'rgba(0,0,0,0.15)',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.02)'
};

const responseGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
};

const roadmapCardStyle = {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '400px',
    overflowY: 'auto'
};

const cardTitleStyle = {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    margin: '0 0 15px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '10px'
};

const timelineContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    position: 'relative',
    paddingLeft: '10px'
};

const timelineItemStyle = {
    display: 'flex',
    gap: '12px',
    position: 'relative'
};

const timelineNodeStyle = {
    width: '24px',
    height: '24px',
    background: 'var(--primary)',
    border: '3px solid var(--bg-dark)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 800,
    color: 'white',
    flexShrink: 0,
    zIndex: 2
};

const timelineContentStyle = {
    background: 'rgba(0,0,0,0.15)',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.02)',
    flex: 1
};

const timelineHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '6px'
};

const timelineTitleStyle = {
    fontWeight: 700,
    fontSize: '0.8rem',
    color: 'var(--text-primary)'
};

const timelineTargetBadgeStyle = {
    fontSize: '0.75rem',
    fontWeight: 800,
    color: 'var(--primary)',
    background: 'rgba(99, 102, 241, 0.08)',
    padding: '2px 6px',
    borderRadius: '5px',
    border: '1px solid rgba(99, 102, 241, 0.15)'
};

const timelineDescriptionStyle = {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.35',
    margin: 0
};

const subjectListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
};

const subjectItemStyle = {
    background: 'rgba(0,0,0,0.15)',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.02)'
};

const subjectHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '8px'
};

const subjectTitleContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px'
};

const subjectNameStyle = {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: '1.25'
};

const subjectCodeStyle = {
    fontSize: '0.65rem',
    color: 'var(--text-secondary)',
    fontFamily: 'monospace'
};

const subjectGradeBadgeStyle = (grade) => {
    const isU = grade === 'U';
    return {
        fontSize: '0.7rem',
        fontWeight: 800,
        color: isU ? 'var(--danger)' : 'var(--warning)',
        background: isU ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
        border: isU ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(245, 158, 11, 0.15)',
        padding: '2px 5px',
        borderRadius: '5px',
        flexShrink: 0
    };
};

const subjectAdviceStyle = {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    margin: 0
};

const emptySubjectsStyle = {
    textAlign: 'center',
    padding: '20px 10px',
    color: 'var(--text-secondary)'
};

const tipsCardStyle = {
    padding: '20px'
};

const tipsListStyle = {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
};

const tipsItemStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px'
};

const tipsBulletStyle = {
    marginTop: '2px',
    flexShrink: 0
};

const tipsTextStyle = {
    fontSize: '0.8rem',
    color: 'var(--text-primary)',
    lineHeight: '1.45'
};

export default AiGoalAdvisor;
