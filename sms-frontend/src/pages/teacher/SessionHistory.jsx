import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function SessionHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, avgAttendance: 0 });

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await api.get('/teacher/history');
                setHistory(data);

                // Calculate Summary Stats
                if (data.length > 0) {
                    const totalRate = data.reduce((acc, curr) => acc + curr.attendance_rate, 0);
                    setStats({
                        total: data.length,
                        avgAttendance: Math.round(totalRate / data.length)
                    });
                }
            } catch (error) {
                console.error("Failed to load history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-500">Loading history...</div>;

    return (
        <div className="max-w-6xl mx-auto animate-fade-in-up pb-12">
            
            {/* 1. Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Session History</h1>
                    <p className="text-gray-500 text-sm mt-1">View past classes and attendance reports.</p>
                </div>
                
                <div className="flex gap-4">
                    <div className="bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm text-center min-w-[120px]">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Sessions</p>
                        <p className="text-2xl font-bold text-indigo-600">{stats.total}</p>
                    </div>
                    <div className="bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm text-center min-w-[120px]">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Avg. Rate</p>
                        <p className={`text-2xl font-bold ${stats.avgAttendance >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {stats.avgAttendance}%
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. History Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {history.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs font-semibold tracking-wider">
                                <tr>
                                    <th className="p-5">Date & Class</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5">Attendance Rate</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.map((session) => (
                                    <tr key={session.id} className="hover:bg-gray-50 transition group">
                                        
                                        {/* Column 1: Date & Class Info */}
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="text-center bg-gray-100 p-2 rounded-lg min-w-[50px]">
                                                    <div className="text-xs font-bold text-gray-500 uppercase">{session.date.split(',')[0].split(' ')[0]}</div>
                                                    <div className="text-lg font-bold text-gray-800">{session.date.split(',')[0].split(' ')[1]}</div>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-base">{session.class_name}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                                        <span className="bg-gray-100 px-1.5 rounded text-gray-600 font-medium">{session.course_code}</span>
                                                        • {session.time}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Column 2: Status */}
                                        <td className="p-5">
                                             <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                                                ${session.status === 'active' 
                                                    ? 'bg-green-50 text-green-600 border-green-100' 
                                                    : 'bg-gray-50 text-gray-500 border-gray-200'}
                                            `}>
                                                {session.status === 'active' ? '● In Progress' : 'Completed'}
                                            </span>
                                        </td>

                                        {/* Column 3: Attendance Rate */}
                                        <td className="p-5">
                                            <div className="max-w-[140px]">
                                                <div className="flex justify-between text-xs mb-1 font-medium">
                                                    <span className={session.attendance_rate < 70 ? 'text-red-600' : 'text-gray-700'}>
                                                        {session.attendance_rate}% Present
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                            session.attendance_rate >= 85 ? 'bg-green-500' : 
                                                            session.attendance_rate >= 60 ? 'bg-yellow-400' : 'bg-red-500'
                                                        }`} 
                                                        style={{ width: `${session.attendance_rate}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Column 4: Actions */}
                                        <td className="p-5 text-right">
                                            <button 
                                                onClick={() => alert(`View details for session ${session.id}`)}
                                                className="text-gray-400 hover:text-indigo-600 font-medium text-sm transition flex items-center justify-end gap-1 ml-auto"
                                            >
                                                View Report <span>→</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    // Empty State
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            📂
                        </div>
                        <h3 className="text-gray-900 font-bold text-lg">No History Yet</h3>
                        <p className="text-gray-500 mt-2">Start a class session to see it appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}