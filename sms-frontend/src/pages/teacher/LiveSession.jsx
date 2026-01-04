import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import api from "../../api/axios";

export default function LiveSession() {
    const { state } = useLocation();
    const navigate = useNavigate();
    
    // Attempt to recover session from state OR localStorage (handle refresh)
    const [session, setSession] = useState(
        state?.session || JSON.parse(localStorage.getItem("activeSession"))
    );
    const [attendees, setAttendees] = useState([]);
    const [loadingEnd, setLoadingEnd] = useState(false);

    // Poll for attendance
    useEffect(() => {
        if (!session?.id) return;
        const interval = setInterval(async () => {
            try {
                const { data } = await api.get(`/teacher/session/${session.id}/attendance`);
                setAttendees(data);
            } catch (e) { console.error("Poll error:", e); }
        }, 3000);
        return () => clearInterval(interval);
    }, [session]);

    const handleEndClass = async () => {
        if (!confirm("Are you sure you want to end this session?")) return;
        
        setLoadingEnd(true);
        try {
            if (session?.id) {
                await api.post(`/teacher/session/${session.id}/end`);
            }
        } catch (error) {
            console.error("End session error:", error);
        } finally {
            // 🛑 CLEANUP STEPS
            // 1. Remove from storage
            localStorage.removeItem("activeSession");
            
            // 2. Update Sidebar immediately
            window.dispatchEvent(new Event("sessionUpdated"));
            
            setLoadingEnd(false);
            navigate('/teacher/classes');
        }
    };

    if (!session) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-xl font-bold">No Active Session</h2>
                <button onClick={() => navigate('/teacher/classes')} className="text-blue-600 underline mt-4">
                    Back to Classes
                </button>
            </div>
        );
    }

    // Display 'qr_token' as the manual code since we are using that field now
    const displayCode = session.qr_token || "LOADING";

    return (
        <div className="h-full flex flex-col p-6 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        🔴 Live Attendance
                    </h1>
                </div>
                
                <button 
                    onClick={handleEndClass} 
                    disabled={loadingEnd}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition"
                >
                    {loadingEnd ? "Ending..." : "End Class"}
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                {/* QR Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col items-center justify-center p-8">
                    <h2 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-6">Scan to Join</h2>
                    <div className="p-6 bg-white border-4 border-dashed border-gray-300 rounded-xl">
                        {session.qr_token ? (
                            <QRCode 
                                value={session.qr_token} 
                                size={256}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                            />
                        ) : <div className="text-gray-400">Generating...</div>}
                    </div>
                    <p className="text-gray-500 mt-8 mb-1">Or enter code manually:</p>
                    <p className="text-5xl font-mono font-bold text-blue-600 tracking-wider">{displayCode}</p>
                </div>

                {/* Attendees Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[500px] lg:h-auto overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Present Students</h3>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Total: {attendees.length}</span>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2">
                        {attendees.map((att, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg mb-2">
                                <span className="font-medium text-gray-800">{att.student?.name || "Student"}</span>
                                <span className="text-xs text-gray-400">{new Date(att.created_at).toLocaleTimeString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}