import React, { useState } from "react";
import {
  Search,
  RotateCcw,
  Printer,
  Copy,
  LayoutDashboard,
  Table as TableIcon,
  Activity,
  GraduationCap,
  ChevronRight,
  ArchiveRestore,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StudentProfile from "./components/StudentProfile";
import AnalysisDashboard from "./components/AnalysisDashboard";
import ReportFooter from "./components/ReportFooter";
import ReportPrintView from "./components/ReportPrintView";
import ManualMarksManager from "./components/ManualMarksManager";

const API_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://cgpa-backend-1wfh.onrender.com";

function App() {
  const [registerNo, setRegisterNo] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("sgpa");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedSemesterResults, setSelectedSemesterResults] = useState(null);

  const formatDob = (value) => {
    let clean = value.replace(/\D/g, "");
    if (clean.length <= 2) return clean;
    if (clean.length <= 4) return clean.slice(0, 2) + "-" + clean.slice(2);
    return (
      clean.slice(0, 2) + "-" + clean.slice(2, 4) + "-" + clean.slice(4, 8)
    );
  };

  const triggerBackgroundFetch = async (regNo, db) => {
    setBackgroundLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/fetch-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registerNo: regNo,
          dob: db,
          forceRefresh: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setData(result);
      }
    } catch (err) {
      console.error("Background fetch error:", err);
    } finally {
      setBackgroundLoading(false);
    }
  };

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!registerNo || !dob) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setData(null); // Clear previous student data immediately
    setSelectedSemesterResults(null);

    try {
      const response = await fetch(`${API_URL}/api/fetch-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registerNo, dob }),
      });

      const result = await response.json();

      if (result.success) {
        setData(result);

        if (result.isCached) {
          setLoading(false); // Stop block loader immediately
          triggerBackgroundFetch(registerNo, dob); // Pull fresh results in background
        } else {
          setLoading(false);
        }
      } else {
        setError(result.error || result.message || "Failed to fetch results");
        setLoading(false);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        "Connection failed. Please ensure the backend server is running and the college portal is accessible.",
      );
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setRegisterNo("");
    setDob("");
    setSelectedSemesterResults(null);
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <div>
        <div className="container" style={{ flex: "1 0 auto" }}>
          {/* Ambient Background Circles */}
          <div
            className="no-print"
            style={{
              position: "fixed",
              top: "-10%",
              left: "-10%",
              width: "40%",
              height: "40%",
              background:
                "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)",
              zIndex: -1,
            }}
          ></div>
          <div
            className="no-print"
            style={{
              position: "fixed",
              bottom: "-10%",
              right: "-10%",
              width: "40%",
              height: "40%",
              background:
                "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)",
              zIndex: -1,
            }}
          ></div>

          <header className="no-print" style={headerStyle}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h1 style={titleStyle}>
                {/* <GraduationCap
                  size={48}
                  style={{
                    verticalAlign: "middle",
                    marginRight: "15px",
                    color: "var(--primary)",
                  }}
                /> */}
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="header-logo"
                />
                My CGPA
              </h1>
              <p style={subtitleStyle}>
                Between B(birth) and D(death) there is C <br />C for CGPA.
              </p>
            </motion.div>
          </header>

          <motion.div
            layout
            className="form-section glass-card no-print"
            style={formSectionStyle}
          >
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={errorStyle}
                >
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
                    onChange={(e) =>
                      setRegisterNo(e.target.value.toUpperCase())
                    }
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
                <button
                  type="submit"
                  disabled={loading}
                  style={primaryBtnStyle}
                >
                  {loading ? (
                    <span className="btn-spinner"></span>
                  ) : (
                    <>
                      <Search size={20} /> Analyze Data
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  style={secondaryBtnStyle}
                >
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
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    letterSpacing: "1px",
                  }}
                >
                  ANALYZING ACADEMIC DATA...
                </div>
                <div
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    marginTop: "10px",
                  }}
                >
                  This may take up to 60 seconds if the college portal is slow
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {data && (
            <div className="results-section">
              {backgroundLoading && (
                <div
                  className="no-print background-updating-indicator"
                  style={backgroundUpdatingIndicatorStyle}
                >
                  <RefreshCw
                    size={16}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  <span>
                    Syncing fresh results from college portal in background...
                  </span>
                </div>
              )}
              <StudentProfile data={data} registerNo={registerNo} />

              <div
                className="no-print cgpa-container"
                style={cgpaContainerStyle}
              >
                <div className="glass-card" style={cgpaCardStyle}>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "rgba(255,255,255,0.7)",
                      letterSpacing: "1px",
                    }}
                  >
                    OVERALL CGPA
                  </div>
                  <div
                    style={{
                      fontSize: "4.5rem",
                      fontWeight: 800,
                      margin: "10px 0",
                      background: "linear-gradient(to right, #fff, #94a3b8)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {data.cgpa}
                  </div>
                  <div
                    style={{
                      padding: "8px 20px",
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "20px",
                      display: "inline-block",
                      fontSize: "0.8rem",
                    }}
                  >
                    10.0 Scale
                  </div>
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
                {["sgpa", "results", "analysis"].map((tab) => (
                  <button
                    key={tab}
                    className={`tab-button ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "sgpa" && <LayoutDashboard size={18} />}
                    {tab === "results" && <TableIcon size={18} />}
                    {tab === "analysis" && <Activity size={18} />}
                    {/* {tab === 'manual' && <ArchiveRestore size={18} />} */}
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="tab-content" style={{ marginTop: "30px" }}>
                {activeTab === "sgpa" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={sgpaGridStyle}
                  >
                    {data.sgpa.map((sem) => (
                      <div
                        key={sem.semester}
                        className="glass-card"
                        style={sgpaCardStyleItem}
                      >
                        <div
                          style={{
                            fontSize: "0.9rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Semester {sem.semester}
                        </div>
                        <div
                          style={{
                            fontSize: "2rem",
                            fontWeight: 800,
                            color: "var(--primary)",
                            marginTop: "10px",
                          }}
                        >
                          {sem.sgpa}
                        </div>
                        <div
                          style={{
                            height: "4px",
                            width: "40px",
                            background: "var(--primary)",
                            margin: "15px auto 0",
                            borderRadius: "2px",
                          }}
                        ></div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === "results" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={sgpaGridStyle}
                  >
                    {[1, 2]
                      .filter((sem) =>
                        data.results.some((r) => r.semester === sem),
                      )
                      .map((sem) => {
                        const semResults = data.results.filter(
                          (r) => r.semester === sem,
                        );
                        const totalSubjects = semResults.length;
                        const passCount = semResults.filter(
                          (r) => r.status === "Pass",
                        ).length;
                        const failCount = semResults.filter(
                          (r) => r.status === "Fail",
                        ).length;
                        const semSgpa =
                          data.sgpa.find((s) => s.semester === sem)?.sgpa ||
                          "N/A";

                        return (
                          <motion.div
                            key={sem}
                            whileHover={{ scale: 1.02, translateY: -4 }}
                            className="glass-card"
                            onClick={() => setSelectedSemesterResults(sem)}
                            style={semesterCardStyle}
                          >
                            <div style={semesterCardHeaderStyle}>
                              <GraduationCap
                                size={24}
                                style={{ color: "var(--primary)" }}
                              />
                              <span style={semesterCardTitleStyle}>
                                Semester {sem}
                              </span>
                            </div>
                            <div style={semesterCardStatsStyle}>
                              <div style={semesterCardStatItemStyle}>
                                <span style={semesterCardStatLabelStyle}>
                                  SGPA
                                </span>
                                <span style={semesterCardStatValueStyle}>
                                  {semSgpa}
                                </span>
                              </div>
                              <div style={semesterCardStatItemStyle}>
                                <span style={semesterCardStatLabelStyle}>
                                  Subjects
                                </span>
                                <span style={semesterCardStatValueStyle}>
                                  {totalSubjects}
                                </span>
                              </div>
                              <div style={semesterCardStatItemStyle}>
                                <span style={semesterCardStatLabelStyle}>
                                  Backlogs
                                </span>
                                <span
                                  style={{
                                    ...semesterCardStatValueStyle,
                                    color:
                                      failCount > 0
                                        ? "var(--danger)"
                                        : "var(--success)",
                                  }}
                                >
                                  {failCount}
                                </span>
                              </div>
                            </div>
                            <div style={viewDetailsBtnStyle}>
                              View Results <ChevronRight size={16} />
                            </div>
                          </motion.div>
                        );
                      })}
                  </motion.div>
                )}

                {activeTab === "analysis" && (
                  <div className="no-print">
                    <AnalysisDashboard data={data} />
                  </div>
                )}

                {/* {activeTab === 'manual' && (
                                <div>
                                    <ManualMarksManager
                                        registerNo={registerNo}
                                        studentName={data.student}
                                    />
                                </div>
                            )} */}
              </div>

              <div
                className="no-print action-buttons"
                style={actionButtonsStyle}
              >
                <button
                  style={primaryBtnActionStyle}
                  onClick={() => setShowPreview(true)}
                >
                  <Activity size={20} /> Preview Report
                </button>
                <button
                  style={secondaryBtnActionStyle}
                  onClick={handleDownload}
                >
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
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={modalHeaderStyle}>
                        <h3 style={{ margin: 0 }}>Report Preview</h3>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={handleDownload}
                            style={printBtnStyle}
                          >
                            <Printer size={16} /> Print Now
                          </button>
                          <button
                            onClick={() => setShowPreview(false)}
                            style={closeBtnStyle}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div style={modalBodyStyle}>
                        <ReportPrintView data={data} registerNo={registerNo} />
                      </div>
                    </motion.div>
                  </motion.div>
                )}
                {selectedSemesterResults !== null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="no-print"
                    style={resultsModalOverlayStyle}
                    onClick={() => setSelectedSemesterResults(null)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      style={resultsModalContentStyle}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={resultsModalHeaderStyle}>
                        <h3 style={{ margin: 0 }}>
                          Semester {selectedSemesterResults} Results
                        </h3>
                        <button
                          onClick={() => setSelectedSemesterResults(null)}
                          style={resultsModalCloseBtnStyle}
                        >
                          ✕
                        </button>
                      </div>
                      <div style={resultsModalBodyStyle}>
                        <div className="table-container desktop-only-results">
                          <table
                            className="results-table"
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr>
                                <th style={thStyle}>S.No</th>
                                <th style={thStyle}>Subject Details</th>
                                <th style={thStyle}>CIA / CE</th>
                                <th style={thStyle}>Total</th>
                                <th style={thStyle}>Grade</th>
                                <th style={thStyle}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.results
                                .filter(
                                  (r) => r.semester === selectedSemesterResults,
                                )
                                .map((r, i) => (
                                  <tr key={i}>
                                    <td style={tdStyle}>{i + 1}</td>
                                    <td style={tdStyle}>
                                      <div style={{ fontWeight: 600 }}>
                                        {r.subjectName}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: "0.75rem",
                                          opacity: 0.6,
                                        }}
                                      >
                                        {r.subjectCode}
                                      </div>
                                    </td>
                                    <td style={tdStyle}>
                                      {r.internalMarks} / {r.externalMarks}
                                    </td>
                                    <td style={tdStyle}>{r.totalMarks}</td>
                                    <td style={tdStyle}>
                                      <span style={gradeBadgeStyle(r.grade)}>
                                        {r.grade}
                                      </span>
                                    </td>
                                    <td
                                      style={{
                                        ...tdStyle,
                                        color:
                                          r.status === "Pass"
                                            ? "var(--success)"
                                            : "var(--danger)",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {r.status}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mobile-only-results">
                          {data.results
                            .filter(
                              (r) => r.semester === selectedSemesterResults,
                            )
                            .map((r, i) => (
                              <div key={i} className="mobile-result-row">
                                <div className="mobile-result-header">
                                  <span className="mobile-result-sno">
                                    {i + 1}
                                  </span>
                                  <div className="mobile-result-subject">
                                    <span className="mobile-result-title">
                                      {r.subjectName}
                                    </span>
                                    <span className="mobile-result-code">
                                      {r.subjectCode}
                                    </span>
                                  </div>
                                </div>
                                <div className="mobile-result-details">
                                  <div className="mobile-result-stat">
                                    <span className="mobile-result-label">
                                      CIA/CE
                                    </span>
                                    <span className="mobile-result-value">
                                      {r.internalMarks}/{r.externalMarks}
                                    </span>
                                  </div>
                                  <div className="mobile-result-stat">
                                    <span className="mobile-result-label">
                                      Total
                                    </span>
                                    <span className="mobile-result-value">
                                      {r.totalMarks}
                                    </span>
                                  </div>
                                  <div className="mobile-result-stat">
                                    <span className="mobile-result-label">
                                      Grade
                                    </span>
                                    <span style={gradeBadgeStyle(r.grade)}>
                                      {r.grade}
                                    </span>
                                  </div>
                                  <div className="mobile-result-stat">
                                    <span className="mobile-result-label">
                                      Status
                                    </span>
                                    <span
                                      className={`mobile-result-status ${r.status.toLowerCase()}`}
                                    >
                                      {r.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      <div className="no-print" style={copyrightStyle}>
        Created by{" "}
        <a
          href="https://ranjithbabu.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          Ranjith Babu
        </a>{" "}
        ( Department of MCA, GTNAC )
      </div>

      {/* OFFICIAL PRINT VIEW (OUTSIDE CONTAINER TO AVOID NESTED DISPLAY:NONE) */}
      {data && (
        <div className="print-only-container">
          <ReportPrintView data={data} registerNo={registerNo} />
        </div>
      )}
    </div>
  );
}

// Updated Styles
const backgroundUpdatingIndicatorStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  padding: "12px 24px",
  background: "rgba(99, 102, 241, 0.08)",
  border: "1px solid rgba(99, 102, 241, 0.2)",
  borderRadius: "12px",
  marginBottom: "20px",
  fontSize: "0.9rem",
  color: "#a5b4fc",
  fontWeight: 500,
};
const headerStyle = { textAlign: "center", marginBottom: "50px" };
const titleStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "3.5rem",
  fontWeight: 900,
  letterSpacing: "-1px",
  marginBottom: "10px",
};
const subtitleStyle = {
  color: "var(--text-secondary)",
  fontSize: "1.2rem",
  letterSpacing: "1px",
};
const formSectionStyle = { padding: "40px", marginBottom: "50px" };
const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "30px",
  marginBottom: "30px",
};
const labelStyle = {
  display: "block",
  marginBottom: "12px",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "1px",
};
const inputStyle = {
  width: "100%",
  padding: "16px 20px",
  background: "rgba(0,0,0,0.2)",
  border: "1px solid var(--glass-border)",
  borderRadius: "12px",
  color: "white",
  fontSize: "1rem",
  transition: "all 0.3s",
};
const btnGroupStyle = { display: "flex", gap: "20px" };
const primaryBtnStyle = {
  flex: 2,
  padding: "16px",
  background: "linear-gradient(135deg, var(--primary), var(--secondary))",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  fontWeight: 700,
  fontSize: "1rem",
  transition: "all 0.3s",
};
const secondaryBtnStyle = {
  flex: 1,
  padding: "16px",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  border: "1px solid var(--glass-border)",
  borderRadius: "12px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  fontWeight: 600,
};
const errorStyle = {
  background: "rgba(239, 68, 68, 0.1)",
  color: "var(--danger)",
  padding: "15px",
  borderRadius: "12px",
  marginBottom: "25px",
  border: "1px solid rgba(239, 68, 68, 0.2)",
  fontSize: "0.9rem",
};

const cgpaContainerStyle = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.8fr",
  gap: "25px",
  marginBottom: "40px",
};
const cgpaCardStyle = {
  padding: "50px 30px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};
const sideStatsStyle = {
  display: "grid",
  gridTemplateRows: "1fr 1fr",
  gap: "20px",
};
const miniStatStyle = {
  padding: "25px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};
const miniLabelStyle = {
  fontSize: "0.75rem",
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "1.5px",
  marginBottom: "8px",
};
const miniValueStyle = { fontSize: "2.5rem", fontWeight: 800 };

const tabsStyle = {
  display: "flex",
  gap: "15px",
  borderBottom: "1px solid var(--border)",
  paddingBottom: "0",
  overflowX: "auto",
};
const sgpaGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "20px",
};
const sgpaCardStyleItem = { padding: "30px", textAlign: "center" };

const thStyle = {
  padding: "18px 20px",
  textAlign: "left",
  fontSize: "0.75rem",
  textTransform: "uppercase",
  color: "var(--text-secondary)",
  letterSpacing: "1px",
};
const tdStyle = {
  padding: "18px 20px",
  fontSize: "0.95rem",
  borderBottom: "1px solid rgba(255,255,255,0.03)",
};
const gradeBadgeStyle = (grade) => {
  const colors = {
    "O+": "#22c55e",
    O: "#16a34a",

    "D++": "#06b6d4",
    "D+": "#0ea5e9",
    D: "#3b82f6",

    "A++": "#6366f1",
    "A+": "#8b5cf6",
    A: "#a855f7",

    "B+": "#f59e0b",
    B: "#f97316",

    "C+": "#eab308",
    C: "#94a3b8",

    U: "#ef4444",
  };
  const color = colors[grade] || "var(--primary)";
  return {
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "0.8rem",
    fontWeight: 800,
    background: `${color}15`,
    color: color,
    border: `1px solid ${color}30`,
  };
};

const actionButtonsStyle = {
  display: "flex",
  gap: "20px",
  justifyContent: "center",
  marginTop: "50px",
};
const primaryBtnActionStyle = {
  padding: "16px 35px",
  background: "white",
  color: "black",
  border: "none",
  borderRadius: "14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  fontWeight: 800,
  fontSize: "1rem",
  transition: "all 0.3s",
};
const secondaryBtnActionStyle = {
  padding: "16px 30px",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  border: "1px solid var(--glass-border)",
  borderRadius: "14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontWeight: 600,
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.85)",
  backdropFilter: "blur(10px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "20px",
};
const modalContentStyle = {
  background: "white",
  width: "100%",
  maxWidth: "900px",
  maxHeight: "90vh",
  borderRadius: "20px",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  color: "black",
};
const modalHeaderStyle = {
  padding: "20px 30px",
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#f8fafc",
};
const modalBodyStyle = {
  padding: "30px",
  overflowY: "auto",
  flex: 1,
  background: "#fff",
};
const printBtnStyle = {
  padding: "8px 16px",
  background: "var(--primary)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontWeight: 600,
  fontSize: "0.9rem",
};
const closeBtnStyle = {
  background: "none",
  border: "none",
  fontSize: "1.2rem",
  cursor: "pointer",
  color: "#64748b",
};
const copyrightStyle = {
  textAlign: "center",
  padding: "16px",
  fontSize: "14px",
  color: "#666",
  borderTop: "1px solid #e5e5e5",
  marginTop: "auto",
  letterSpacing: "0.5px",
  backgroundColor: "#fafafa",
};

const linkStyle = {
  color: "rgb(30, 41, 59)",
  textDecoration: "none",
  fontWeight: "600",
  transition: "0.3s ease",
};

const semesterCardStyle = {
  padding: "30px",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: "20px",
  transition: "all 0.3s ease",
  minHeight: "220px",
};

const semesterCardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  paddingBottom: "12px",
};

const semesterCardTitleStyle = {
  fontSize: "1.25rem",
  fontWeight: 700,
  color: "var(--text-primary)",
};

const semesterCardStatsStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "10px",
  textAlign: "center",
};

const semesterCardStatItemStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const semesterCardStatLabelStyle = {
  fontSize: "0.7rem",
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const semesterCardStatValueStyle = {
  fontSize: "1.1rem",
  fontWeight: 800,
  color: "var(--text-primary)",
};

const viewDetailsBtnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "var(--primary)",
  marginTop: "5px",
};

const resultsModalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(11, 15, 26, 0.85)",
  backdropFilter: "blur(16px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "20px",
};

const resultsModalContentStyle = {
  background: "rgba(15, 23, 42, 0.95)",
  border: "1px solid var(--glass-border)",
  width: "100%",
  maxWidth: "900px",
  maxHeight: "85vh",
  borderRadius: "24px",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  color: "var(--text-primary)",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
};

const resultsModalHeaderStyle = {
  padding: "20px 30px",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(30, 41, 59, 0.8)",
};

const resultsModalBodyStyle = {
  padding: "30px",
  overflowY: "auto",
  flex: 1,
};

const resultsModalCloseBtnStyle = {
  background: "none",
  border: "none",
  fontSize: "1.5rem",
  cursor: "pointer",
  color: "var(--text-secondary)",
  transition: "color 0.2s",
  outline: "none",
  padding: "5px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default App;
