import React, { useEffect, useMemo, useState } from 'react';
import {
    Plus,
    Trash2,
    Pencil,
    Save,
    X,
    Search,
    Filter,
    GraduationCap
} from 'lucide-react';

const API_URL = 'http://localhost:5000';

const initialForm = {
    semester: '',
    subjectCode: '',
    subjectName: '',
    internalMarks: '',
    externalMarks: '',
    credits: ''
};

function getGradeFromMarks(total) {

    if (total >= 95) return 'O+';
    if (total >= 90) return 'O';
    if (total >= 85) return 'D++';
    if (total >= 80) return 'D+';
    if (total >= 75) return 'D';
    if (total >= 70) return 'A++';
    if (total >= 65) return 'A+';
    if (total >= 60) return 'A';
    if (total >= 55) return 'B+';
    if (total >= 50) return 'B';
    if (total >= 45) return 'C+';
    if (total >= 40) return 'C';

    return 'U';
}

export default function ManualMarksManager({

    registerNo,
    studentName

}) {

    const [results, setResults] = useState([]);

    const [formData, setFormData] =
        useState(initialForm);

    const [editingId, setEditingId] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [search, setSearch] =
        useState('');

    const [semesterFilter, setSemesterFilter] =
        useState('ALL');

    // ----------------------------
    // FETCH RESULTS
    // ----------------------------

    async function fetchResults() {

        try {

            const response = await fetch(
                `${API_URL}/api/manual-results/${registerNo}`
            );

            const data = await response.json();

            if (data.success) {

                setResults(data.results);
            }

        } catch (error) {

            console.log(error);
        }
    }

    useEffect(() => {

        if (registerNo) {
            fetchResults();
        }

    }, [registerNo]);

    // ----------------------------
    // HANDLE CHANGE
    // ----------------------------

    function handleChange(e) {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value
        });
    }

    // ----------------------------
    // SAVE RESULT
    // ----------------------------

    async function handleSave() {

        try {

            setLoading(true);

            const internal =
                Number(formData.internalMarks);

            const external =
                Number(formData.externalMarks);

            const total =
                internal + external;

            const payload = {

                registerNo,

                student: studentName,

                semester:
                    Number(formData.semester),

                subjectCode:
                    formData.subjectCode,

                subjectName:
                    formData.subjectName,

                internalMarks:
                    internal,

                externalMarks:
                    external,

                totalMarks:
                    total,

                credits:
                    Number(formData.credits),

                grade:
                    getGradeFromMarks(total),

                status:
                    total >= 40
                        ? 'Pass'
                        : 'Fail'
            };

            let url =
                `${API_URL}/api/manual-results`;

            let method = 'POST';

            if (editingId) {

                url += `/${editingId}`;

                method = 'PUT';
            }

            const response = await fetch(url, {

                method,

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body:
                    JSON.stringify(payload)
            });

            const data =
                await response.json();

            if (data.success) {

                fetchResults();

                setFormData(initialForm);

                setEditingId(null);
            }

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);
        }
    }

    // ----------------------------
    // DELETE
    // ----------------------------

    async function handleDelete(id) {

        if (!window.confirm(
            'Delete this subject?'
        )) return;

        try {

            await fetch(
                `${API_URL}/api/manual-results/${id}`,
                {
                    method: 'DELETE'
                }
            );

            fetchResults();

        } catch (error) {

            console.log(error);
        }
    }

    // ----------------------------
    // EDIT
    // ----------------------------

    function handleEdit(item) {

        setEditingId(item._id);

        setFormData({

            semester:
                item.semester,

            subjectCode:
                item.subjectCode,

            subjectName:
                item.subjectName,

            internalMarks:
                item.internalMarks,

            externalMarks:
                item.externalMarks,

            credits:
                item.credits
        });

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // ----------------------------
    // FILTER + SEARCH
    // ----------------------------

    const filteredResults =
        useMemo(() => {

            return results
                .filter(item => {

                    const matchesSearch =

                        item.subjectName
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            ) ||

                        item.subjectCode
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            );

                    const matchesSemester =

                        semesterFilter === 'ALL'
                        ||
                        item.semester ===
                        Number(semesterFilter);

                    return (
                        matchesSearch &&
                        matchesSemester
                    );
                })

                .sort(
                    (a, b) =>
                        a.semester -
                        b.semester
                );

        }, [
            results,
            search,
            semesterFilter
        ]);

    // ----------------------------
    // TOTALS
    // ----------------------------

    const cgpa = useMemo(() => {

        if (!results.length)
            return '0.00';

        const total =
            results.reduce(

                (sum, r) =>
                    sum +
                    (r.totalMarks / 10),

                0
            );

        return (
            total / results.length
        ).toFixed(2);

    }, [results]);

    // ----------------------------
    // UI
    // ----------------------------

    return (

        <div style={containerStyle}>

            {/* TOP HEADER */}

            <div style={heroStyle}>

                <div>

                    <div style={chipStyle}>
                        Academic ERP System
                    </div>

                    <h1 style={mainTitleStyle}>
                        Manual Marks Manager
                    </h1>

                    <p style={heroTextStyle}>
                        Add, edit, organize and manage
                        semester-wise academic results
                        with live analytics.
                    </p>
                </div>

                <div style={statsContainerStyle}>

                    <div style={statCardStyle}>
                        <h4>Total Subjects</h4>
                        <h2>{results.length}</h2>
                    </div>

                </div>

            </div>

            {/* FORM */}

            <div style={formCardStyle}>

                <div style={sectionHeaderStyle}>

                    <h2>
                        {editingId
                            ? 'Edit Subject'
                            : 'Add Subject'}
                    </h2>

                    <div style={dotStyle}></div>

                </div>

                <div style={gridStyle}>

                    <input
                        name="semester"
                        placeholder="Semester"
                        value={formData.semester}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <input
                        name="subjectCode"
                        placeholder="Subject Code"
                        value={formData.subjectCode}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <input
                        name="subjectName"
                        placeholder="Subject Name"
                        value={formData.subjectName}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <input
                        name="internalMarks"
                        placeholder="CIA Marks"
                        value={formData.internalMarks}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <input
                        name="externalMarks"
                        placeholder="External Marks"
                        value={formData.externalMarks}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <input
                        name="credits"
                        placeholder="Credits"
                        value={formData.credits}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                </div>

                <div style={actionStyle}>

                    <button
                        onClick={handleSave}
                        style={saveBtnStyle}
                    >
                        <Save size={18} />

                        {loading
                            ? 'Saving...'
                            : editingId
                                ? 'Update Subject'
                                : 'Save Subject'}
                    </button>

                    {editingId && (

                        <button
                            onClick={() => {

                                setEditingId(null);

                                setFormData(initialForm);

                            }}
                            style={cancelBtnStyle}
                        >
                            <X size={18} />
                            Cancel
                        </button>
                    )}

                </div>
            </div>

            {/* TOOLBAR */}

            <div style={toolbarStyle}>

                <div style={searchBoxStyle}>

                    <Search size={18} />

                    <input
                        placeholder="Search subject..."
                        value={search}
                        onChange={e =>
                            setSearch(e.target.value)
                        }
                        style={searchInputStyle}
                    />
                </div>

                <div style={filterBoxStyle}>

                    <Filter size={18} />

                    <select
                        value={semesterFilter}
                        onChange={e =>
                            setSemesterFilter(
                                e.target.value
                            )
                        }
                        style={selectStyle}
                    >
                        <option value="ALL">
                            All Semesters
                        </option>

                        {[1, 2, 3, 4, 5, 6]
                            .map(sem => (

                                <option
                                    key={sem}
                                    value={sem}
                                >
                                    Semester {sem}
                                </option>
                            ))}

                    </select>

                </div>

            </div>

            {/* TABLE */}

            <div style={tableWrapperStyle}>

                <table style={tableStyle}>

                    <thead>

                        <tr>

                            <th style={thStyle}>Sem</th>
                            <th style={thStyle}>Code</th>
                            <th style={thStyle}>Subject</th>
                            {/* <th style={thStyle}>CIA</th> */}
                            {/* <th style={thStyle}>External</th> */}
                            <th style={thStyle}>Total</th>
                            {/* <th style={thStyle}>Credits</th> */}
                            <th style={thStyle}>Grade</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Actions</th>

                        </tr>

                    </thead>

                    <tbody>

                        {filteredResults.map(item => (

                            <tr
                                key={item._id}
                                style={trStyle}
                            >

                                <td style={tdStyle}>
                                    {item.semester}
                                </td>

                                <td style={tdStyle}>
                                    {item.subjectCode}
                                </td>

                                <td style={tdStyle}>
                                    <div style={{
                                        fontWeight: 600
                                    }}>
                                        {item.subjectName}
                                    </div>
                                </td>

                                {/* <td style={tdStyle}>
                                    {item.internalMarks}
                                </td>

                                <td style={tdStyle}>
                                    {item.externalMarks}
                                </td> */}

                                <td style={tdStyle}>
                                    <strong>
                                        {item.totalMarks}
                                    </strong>
                                </td>

                                {/* <td style={tdStyle}>
                                    {item.credits}
                                </td> */}

                                <td style={tdStyle}>

                                    <span style={
                                        gradeBadgeStyle(
                                            item.grade
                                        )
                                    }>
                                        {item.grade}
                                    </span>

                                </td>

                                <td style={tdStyle}>

                                    <span style={
                                        statusBadgeStyle(
                                            item.status
                                        )
                                    }>
                                        {item.status}
                                    </span>

                                </td>

                                <td style={tdStyle}>

                                    <div style={{
                                        display: 'flex',
                                        gap: '10px'
                                    }}>

                                        <button
                                            onClick={() =>
                                                handleEdit(item)
                                            }
                                            style={editBtnStyle}
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(item._id)
                                            }
                                            style={deleteBtnStyle}
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                    </div>

                                </td>

                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

// ----------------------------
// STYLES
// ----------------------------
// ============================
// MAIN CONTAINER
// ============================

const containerStyle = {

    minHeight: '100vh',

    padding: '40px',

    background:
        'linear-gradient(135deg,#020617,#0f172a,#111827)',

    color: 'white',

    fontFamily:
        'Inter, sans-serif'
};

// ============================
// HERO SECTION
// ============================

const heroStyle = {

    display: 'flex',

    justifyContent: 'space-between',

    alignItems: 'center',

    flexWrap: 'wrap',

    gap: '30px',

    marginBottom: '40px'
};

const chipStyle = {

    display: 'inline-flex',

    alignItems: 'center',

    padding: '8px 18px',

    borderRadius: '999px',

    background:
        'rgba(59,130,246,0.15)',

    color: '#60a5fa',

    border:
        '1px solid rgba(96,165,250,0.25)',

    marginBottom: '18px',

    fontSize: '0.82rem',

    fontWeight: '700',

    letterSpacing: '0.5px'
};

const mainTitleStyle = {

    fontSize: '3rem',

    fontWeight: '800',

    lineHeight: 1.1,

    marginBottom: '12px'
};

const heroTextStyle = {

    maxWidth: '650px',

    color: '#94a3b8',

    lineHeight: 1.8,

    fontSize: '1rem'
};

// ============================
// STATS
// ============================

const statsContainerStyle = {

    display: 'flex',

    gap: '20px',

    flexWrap: 'wrap'
};

const statCardStyle = {

    minWidth: '180px',

    padding: '24px',

    borderRadius: '26px',

    background:
        'rgba(255,255,255,0.05)',

    border:
        '1px solid rgba(255,255,255,0.08)',

    backdropFilter: 'blur(18px)',

    WebkitBackdropFilter: 'blur(18px)',

    boxShadow:
        '0 12px 40px rgba(0,0,0,0.35)',

    transition: '0.3s ease'
};

// ============================
// FORM CARD
// ============================

const formCardStyle = {

    padding: '32px',

    borderRadius: '30px',

    background:
        'rgba(255,255,255,0.04)',

    border:
        '1px solid rgba(255,255,255,0.08)',

    backdropFilter: 'blur(18px)',

    WebkitBackdropFilter: 'blur(18px)',

    marginBottom: '35px',

    boxShadow:
        '0 12px 40px rgba(0,0,0,0.3)'
};

const sectionHeaderStyle = {

    display: 'flex',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: '25px'
};

const dotStyle = {

    width: '14px',

    height: '14px',

    borderRadius: '50%',

    background:
        'linear-gradient(135deg,#3b82f6,#8b5cf6)',

    boxShadow:
        '0 0 18px rgba(59,130,246,0.7)'
};

// ============================
// GRID
// ============================

const gridStyle = {

    display: 'grid',

    gridTemplateColumns:
        'repeat(auto-fit,minmax(220px,1fr))',

    gap: '18px'
};

// ============================
// INPUT
// ============================

const inputStyle = {

    padding: '16px',

    borderRadius: '18px',

    border:
        '1px solid rgba(255,255,255,0.08)',

    background:
        'rgba(255,255,255,0.03)',

    color: 'white',

    outline: 'none',

    fontSize: '0.95rem',

    transition: '0.25s ease',

    backdropFilter: 'blur(10px)'
};

// ============================
// BUTTON ACTIONS
// ============================

const actionStyle = {

    display: 'flex',

    gap: '16px',

    marginTop: '25px',

    flexWrap: 'wrap'
};

const saveBtnStyle = {

    background:
        'linear-gradient(135deg,#2563eb,#3b82f6)',

    color: 'white',

    border: 'none',

    padding: '14px 24px',

    borderRadius: '18px',

    display: 'flex',

    alignItems: 'center',

    gap: '10px',

    cursor: 'pointer',

    fontWeight: '700',

    boxShadow:
        '0 8px 24px rgba(37,99,235,0.4)',

    transition: '0.25s ease'
};

const cancelBtnStyle = {

    background:
        'rgba(239,68,68,0.12)',

    color: '#ef4444',

    border:
        '1px solid rgba(239,68,68,0.25)',

    padding: '14px 24px',

    borderRadius: '18px',

    display: 'flex',

    alignItems: 'center',

    gap: '10px',

    cursor: 'pointer',

    fontWeight: '700',

    transition: '0.25s ease'
};

// ============================
// TOOLBAR
// ============================

const toolbarStyle = {

    display: 'flex',

    justifyContent: 'space-between',

    alignItems: 'center',

    gap: '20px',

    marginBottom: '30px',

    flexWrap: 'wrap'
};

const searchBoxStyle = {

    flex: 1,

    minWidth: '280px',

    display: 'flex',

    alignItems: 'center',

    gap: '12px',

    padding: '16px 20px',

    borderRadius: '20px',

    background:
        'rgba(255,255,255,0.04)',

    border:
        '1px solid rgba(255,255,255,0.08)',

    backdropFilter: 'blur(16px)',

    boxShadow:
        '0 8px 30px rgba(0,0,0,0.25)'
};

const searchInputStyle = {

    width: '100%',

    background: 'transparent',

    border: 'none',

    outline: 'none',

    color: 'white',

    fontSize: '0.95rem'
};

const filterBoxStyle = {

    display: 'flex',

    alignItems: 'center',

    gap: '12px',

    padding: '16px 20px',

    borderRadius: '20px',

    background:
        'rgba(255,255,255,0.04)',

    border:
        '1px solid rgba(255,255,255,0.08)',

    backdropFilter: 'blur(16px)',

    boxShadow:
        '0 8px 30px rgba(0,0,0,0.25)'
};

const selectStyle = {

    background: 'transparent',

    border: 'none',

    outline: 'none',

    color: 'white',

    fontSize: '0.95rem',

    cursor: 'pointer'
};

// ============================
// TABLE WRAPPER
// ============================

const tableWrapperStyle = {

    width: '100%',

    overflowX: 'auto',

    borderRadius: '32px',

    padding: '18px',

    background:
        'linear-gradient(145deg, rgba(15,23,42,0.92), rgba(17,24,39,0.88))',

    backdropFilter: 'blur(22px)',

    WebkitBackdropFilter: 'blur(22px)',

    border:
        '1px solid rgba(255,255,255,0.08)',

    boxShadow:
        `
        0 10px 40px rgba(0,0,0,0.45),
        inset 0 1px 0 rgba(255,255,255,0.05)
        `
};

// ============================
// TABLE
// ============================

const tableStyle = {

    width: '100%',

    minWidth: '120px',

    borderCollapse: 'separate',

    borderSpacing: '0 14px',

    color: 'white',

    fontSize: '0.95rem'
};

// ============================
// TABLE HEAD
// ============================

const thStyle = {

    padding: '20px 24px',

    textAlign: 'left',

    fontSize: '0.78rem',

    fontWeight: '700',

    textTransform: 'uppercase',

    letterSpacing: '1.2px',

    color: '#94a3b8',

    background:
        'rgba(255,255,255,0.03)',

    borderBottom:
        '1px solid rgba(255,255,255,0.08)',

    backdropFilter: 'blur(12px)',

    position: 'sticky',

    top: 0,

    zIndex: 20
};

// ============================
// TABLE ROW
// ============================

const trStyle = {

    transition: 'all 0.25s ease',

    cursor: 'pointer'
};

// ============================
// TABLE CELL
// ============================

const tdStyle = {

    padding: '20px 24px',

    background:
        'rgba(255,255,255,0.025)',

    borderTop:
        '1px solid rgba(255,255,255,0.04)',

    borderBottom:
        '1px solid rgba(255,255,255,0.04)',

    color: '#f8fafc',

    fontSize: '0.93rem',

    transition: 'all 0.25s ease'
};

// ============================
// BUTTONS
// ============================

const editBtnStyle = {

    background:
        'rgba(37,99,235,0.15)',

    border:
        '1px solid rgba(37,99,235,0.25)',

    color: '#60a5fa',

    padding: '10px',

    borderRadius: '12px',

    cursor: 'pointer',

    transition: '0.25s ease'
};

const deleteBtnStyle = {

    background:
        'rgba(239,68,68,0.12)',

    border:
        '1px solid rgba(239,68,68,0.25)',

    color: '#ef4444',

    padding: '10px',

    borderRadius: '12px',

    cursor: 'pointer',

    transition: '0.25s ease'
};

// ============================
// GRADE BADGES
// ============================

const gradeBadgeStyle = grade => {

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

    return {

        display: 'inline-flex',

        alignItems: 'center',

        justifyContent: 'center',

        minWidth: '58px',

        padding: '8px 14px',

        borderRadius: '999px',

        fontSize: '0.82rem',

        fontWeight: '700',

        color: colors[grade] || '#fff',

        background:
            `${colors[grade]}15`,

        border:
            `1px solid ${colors[grade]}40`
    };
};

// ============================
// STATUS BADGE
// ============================

const statusBadgeStyle = status => ({

    display: 'inline-flex',

    alignItems: 'center',

    justifyContent: 'center',

    padding: '8px 14px',

    borderRadius: '999px',

    fontSize: '0.78rem',

    fontWeight: '700',

    background:

        status === 'Pass'
            ? 'rgba(34,197,94,0.15)'
            : 'rgba(239,68,68,0.15)',

    color:

        status === 'Pass'
            ? '#22c55e'
            : '#ef4444',

    border:

        status === 'Pass'
            ? '1px solid rgba(34,197,94,0.35)'
            : '1px solid rgba(239,68,68,0.35)'
});