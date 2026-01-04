import React, { useEffect, useState } from "react";
// We don't need useNavigate here anymore because enterClass handles it!
import api from "../../api/axios";
import { useClass } from "../../context/ClassContext"; // Make sure path is correct

export default function StudentDashboard() {
    // 1. Get the 'enterClass' function from your Context
    const { enterClass } = useClass(); 

    const [stats, setStats] = useState({ attendanceRate: 0, totalClasses: 0 });
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, classesRes] = await Promise.all([
                    api.get('/student/dashboard-stats'),
                    api.get('/student/classes')
                ]);
                setStats(statsRes.data);
                setClasses(classesRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Error loading dashboard:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- 🟢 NEW: Simplified Handler ---
    const handleSelectClass = (cls) => {
        // This single line does 3 things now:
        // 1. Sets React State
        // 2. Saves to LocalStorage
        // 3. Navigates to /student/class/{id}
        enterClass(cls); 
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Portal</h1>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-5 transition hover:shadow-md">
                    <div className="bg-indigo-100 p-4 rounded-full text-indigo-600 text-2xl">📚</div>
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Enrolled Classes</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalClasses}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-5 transition hover:shadow-md">
                    <div className={`${stats.attendanceRate >= 75 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} p-4 rounded-full text-2xl`}>
                        {stats.attendanceRate >= 75 ? '😊' : '⚠️'}
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Avg. Attendance</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.attendanceRate}%</p>
                    </div>
                </div>
            </div>

            {/* Class List Table */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Classes</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Class Name</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Code</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Teacher</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {classes.length > 0 ? (
                            classes.map((cls) => (
                                <tr key={cls.id} className="hover:bg-gray-50 transition duration-150">
                                    <td className="p-4 font-medium text-gray-900">{cls.name}</td>
                                    <td className="p-4 text-gray-500 font-mono text-sm">{cls.course_code}</td>
                                    <td className="p-4 text-gray-600">
                                        {cls.teacher ? cls.teacher.name : <span className="text-gray-400 italic">Unassigned</span>}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            // Pass the FULL class object to your Context
                                            onClick={() => handleSelectClass(cls)}
                                            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm hover:shadow"
                                        >
                                            Select Class →
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-400">
                                    You are not enrolled in any classes yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}