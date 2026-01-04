import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function AttendanceReports() {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Added error state

    // 1. Load Class List on Mount
    useEffect(() => {
        api.get('/admin/classes')
            .then(res => setClasses(res.data))
            .catch(err => console.error("Failed to load classes", err));
    }, []);

    // 2. Fetch Report when a class is selected
    useEffect(() => {
        if (!selectedClassId) {
            setReportData(null); // Clear previous report if selection is cleared
            return;
        }

        setLoading(true);
        setError(null);

        api.get(`/admin/reports/${selectedClassId}`)
            .then(res => {
                setReportData(res.data);
            })
            .catch(err => {
                console.error(err);
                setError("Failed to generate report. Please try again.");
            })
            .finally(() => setLoading(false));
    }, [selectedClassId]);

    // Helper: Determine Status Badge Logic
    const getStatusBadge = (percentage, totalSessions) => {
        // 1. HANDLE NEW CLASS (No sessions yet)
        if (totalSessions === 0) {
            return (
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 shadow-sm w-fit">
                    ⚪ No Sessions Yet
                </span>
            );
        }

        // 2. Normal Logic
        if (percentage < 50) {
            return (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200 shadow-sm flex items-center gap-1 w-fit">
                    ⚠️ See Teacher
                </span>
            );
        } else if (percentage < 70) {
            return (
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 shadow-sm w-fit">
                    ✅ Good
                </span>
            );
        } else {
            return (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 shadow-sm w-fit">
                    🌟 Very Good
                </span>
            );
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Attendance Reports</h1>

            {/* Class Selector */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Class to View Report</label>
                <select
                    className="w-full md:w-1/2 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                >
                    <option value="">-- Choose a Class --</option>
                    {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name} ({cls.course_code})</option>
                    ))}
                </select>
            </div>

            {/* Loading / Error States */}
            {loading && <div className="text-gray-500 text-center py-10 animate-pulse">Generating report...</div>}
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center border border-red-200">{error}</div>}

            {/* Report Content */}
            {!loading && reportData && (
                <div className="space-y-6 animate-fade-in">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <p className="text-blue-600 text-sm font-bold uppercase">Total Sessions Held</p>
                            <p className="text-3xl font-bold text-blue-900">{reportData.total_sessions}</p>
                        </div>
                        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                            <p className="text-indigo-600 text-sm font-bold uppercase">Students Enrolled</p>
                            <p className="text-3xl font-bold text-indigo-900">{reportData.students ? reportData.students.length : 0}</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <p className="text-gray-600 text-sm font-bold uppercase">Class Average</p>
                            <p className="text-3xl font-bold text-gray-800">
                                {reportData.total_sessions === 0 ? "N/A" : (
                                    reportData.students.length > 0
                                        ? Math.round(reportData.students.reduce((acc, curr) => acc + curr.percentage, 0) / reportData.students.length) + "%"
                                        : "0%"
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 font-bold text-gray-700">Student Performance</div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-4">Student Name</th>
                                        <th className="p-4 text-center">Sessions Attended</th>
                                        <th className="p-4 w-1/4">Rate</th>
                                        <th className="p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">

                                    {/* CASE 1: No sessions at all */}
                                    {reportData.total_sessions === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-10 text-center">
                                                <div className="text-gray-400 text-lg font-semibold">
                                                    📭 No attendance sessions yet
                                                </div>
                                                <div className="text-sm text-gray-400 mt-1">
                                                    Start and end a class session to generate attendance data.
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {/* CASE 2: Sessions exist but no students */}
                                    {reportData.total_sessions > 0 && reportData.students.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-gray-400">
                                                No students found in this class.
                                            </td>
                                        </tr>
                                    )}

                                    {/* CASE 3: Normal data */}
                                    {reportData.total_sessions > 0 &&
                                        reportData.students.map(student => {
                                            const isLowAttendance = student.percentage < 50;

                                            return (
                                                <tr
                                                    key={student.id}
                                                    className={isLowAttendance
                                                        ? "bg-red-50 hover:bg-red-100 transition-colors"
                                                        : "hover:bg-gray-50 transition-colors"
                                                    }
                                                >
                                                    <td className="p-4">
                                                        <div className="font-bold text-gray-900">{student.name}</div>
                                                        <div className="text-xs text-gray-500">{student.email}</div>
                                                    </td>

                                                    <td className="p-4 text-center">
                                                        <span className="font-bold text-gray-800 text-lg">
                                                            {student.present_count}
                                                        </span>
                                                        <span className="text-gray-400 text-xs">
                                                            {" "} / {student.total_sessions}
                                                        </span>
                                                    </td>

                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`font-bold w-12 text-right ${isLowAttendance ? 'text-red-700' : 'text-gray-700'}`}>
                                                                {student.percentage}%
                                                            </span>
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden border border-gray-100">
                                                                <div
                                                                    className={`h-2.5 rounded-full ${student.percentage >= 70
                                                                            ? 'bg-green-500'
                                                                            : student.percentage >= 50
                                                                                ? 'bg-yellow-400'
                                                                                : 'bg-red-500'
                                                                        }`}
                                                                    style={{ width: `${student.percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="p-4">
                                                        {getStatusBadge(student.percentage, student.total_sessions)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    }
                                </tbody>

                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}