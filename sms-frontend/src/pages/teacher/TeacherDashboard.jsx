import { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import QRCode from "react-qr-code";
import { useAuth } from "../../context/AuthContext";

export default function TeacherDashboard() {
    const { user, logout } = useAuth();
    // Default to 'dashboard' instead of 'classes'
    const [view, setView] = useState('dashboard'); 
    
    // Data States
    const [classes, setClasses] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [attendees, setAttendees] = useState([]);
    
    // Polling Interval Ref
    const pollRef = useRef(null);

    // 1. Fetch Classes on Load
    useEffect(() => {
        // api.get('/teacher/classes').then(res => setClasses(res.data));
        // MOCK DATA FOR DEMO (Replace with your actual API call above)
        setClasses([
            { id: 1, name: "Intro to React", course_code: "CS101", description: "Monday & Wednesday 9:00 AM" },
            { id: 2, name: "Advanced Laravel", course_code: "CS202", description: "Tuesday & Thursday 1:00 PM" }
        ]);
    }, []);

    // 2. Handle Live Attendance Polling
    useEffect(() => {
        if (activeSession) {
            pollRef.current = setInterval(async () => {
                try {
                    const { data } = await api.get(`/teacher/session/${activeSession.id}/attendance`);
                    setAttendees(data);
                } catch (e) { console.error("Polling error"); }
            }, 3000);
        } else {
            clearInterval(pollRef.current);
        }
        return () => clearInterval(pollRef.current);
    }, [activeSession]);
    // ACTIONS
    const startSession = async (classId) => {
        try {
            // Mock API call
            // const { data } = await api.post('/teacher/session', { class_id: classId });
            // setActiveSession(data);
            setActiveSession({ id: 123, qr_token: "mock_token_" + Date.now() }); // Mock
            setAttendees([]); 
            setView('live-session');
        } catch (e) { alert("Failed to start session"); }
    };

    const endSession = () => {
        if(confirm("Are you sure you want to end this session?")) {
            setActiveSession(null);
            setView('dashboard');
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            
            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col z-20 shadow-xl">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <span className="font-bold text-xl tracking-tight">Teacher<span className="text-purple-400">Hub</span></span>
                </div>

                <div className="p-4">
                    <div className="flex items-center gap-3 mb-6 bg-slate-800 p-3 rounded-xl border border-slate-700/50">
                        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold text-lg text-white">
                            {user?.name?.[0] || "T"}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400">Instructor</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        <SidebarBtn 
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                            label="Dashboard" 
                            active={view === 'dashboard'} 
                            onClick={() => setView('dashboard')} 
                        />
                        <SidebarBtn 
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                            label="My Classes" 
                            active={view === 'classes'} 
                            onClick={() => { if(!activeSession) setView('classes'); else alert("End current session first!"); }} 
                        />
                        {activeSession && (
                            <SidebarBtn 
                                icon={<svg className="w-5 h-5 animate-pulse text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                                label="Live Session" 
                                active={view === 'live-session'} 
                                onClick={() => setView('live-session')} 
                                isLive
                            />
                        )}
                        <SidebarBtn 
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                            label="Students" 
                            active={view === 'students'} 
                            onClick={() => setView('students')} 
                        />
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-slate-800">
                    <button onClick={logout} className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium w-full p-2 rounded-lg hover:bg-slate-800">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
                
                {/* VIEW 1: DASHBOARD HOME (New!) */}
                {view === 'dashboard' && (
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Welcome Banner */}
                        <div className="bg-gradient-to-r from-purple-700 to-indigo-600 rounded-2xl p-8 text-white shadow-lg flex justify-between items-center relative overflow-hidden">
                            <div className="relative z-10">
                                <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
                                <p className="text-purple-100 opacity-90">You have {classes.length} classes scheduled for today.</p>
                            </div>
                            {/* Decorative Circle */}
                            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard label="Total Classes" value={classes.length} icon="📚" color="bg-blue-50 text-blue-600" />
                            <StatCard label="Total Students" value="124" icon="👨‍🎓" color="bg-green-50 text-green-600" />
                            <StatCard label="Hours Taught" value="12.5" icon="⏱" color="bg-orange-50 text-orange-600" />
                        </div>

                        {/* Split Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Schedule */}
                            <div className="lg:col-span-2 space-y-4">
                                <h2 className="text-xl font-bold text-gray-800">Today's Schedule</h2>
                                {classes.length > 0 ? (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                                        {classes.map(cls => (
                                            <div key={cls.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
                                                        {cls.course_code.substring(0,2)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-800">{cls.name}</h3>
                                                        <p className="text-sm text-gray-500">{cls.description}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => { setView('classes'); startSession(cls.id); }} className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition">
                                                    Start
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white p-8 rounded-xl text-center text-gray-400 border border-dashed border-gray-300">
                                        No classes scheduled for today.
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Quick Actions */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-3">
                                    <button onClick={() => setView('classes')} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-left text-gray-700 font-medium">
                                        <span className="bg-blue-100 text-blue-600 p-2 rounded-md">📅</span>
                                        View Full Schedule
                                    </button>
                                    <button onClick={() => setView('students')} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-left text-gray-700 font-medium">
                                        <span className="bg-green-100 text-green-600 p-2 rounded-md">👥</span>
                                        Student Directory
                                    </button>
                                    <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-left text-gray-700 font-medium">
                                        <span className="bg-yellow-100 text-yellow-600 p-2 rounded-md">📢</span>
                                        Post Announcement
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW 2: MY CLASSES */}
                {view === 'classes' && (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">My Classes</h1>
                                <p className="text-gray-500">Manage your courses and start attendance</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {classes.map(cls => (
                                <ClassCard key={cls.id} cls={cls} onStart={() => startSession(cls.id)} />
                            ))}
                            {classes.length === 0 && <p className="text-gray-400 col-span-3 text-center py-10">No classes assigned yet.</p>}
                        </div>
                    </div>
                )}

                {/* VIEW 3: LIVE SESSION */}
                {view === 'live-session' && activeSession && (
                    <div className="max-w-4xl mx-auto flex flex-col items-center">
                        <button onClick={() => setView('dashboard')} className="mb-6 self-start text-gray-500 hover:text-gray-900 flex items-center gap-2">
                             ← Back to Dashboard
                        </button>
                        
                        <div className="w-full bg-purple-600 text-white p-8 rounded-t-2xl shadow-lg text-center relative overflow-hidden">
                            <h2 className="text-3xl font-bold relative z-10 mb-2">Scan to mark attendance</h2>
                            <p className="text-purple-200 relative z-10">Session ID: #{activeSession.id}</p>
                            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 animate-pulse"></div>
                        </div>
                        
                        <div className="bg-white p-10 rounded-b-2xl shadow-xl w-full flex flex-col md:flex-row items-center gap-10 border border-gray-100">
                            <div className="flex flex-col items-center">
                                <div className="bg-white p-4 rounded-xl border-4 border-dashed border-gray-200 shadow-inner">
                                    <QRCode value={activeSession.qr_token} size={200} />
                                </div>
                                <p className="mt-4 text-gray-400 text-xs font-mono tracking-widest uppercase">Live Token Active</p>
                            </div>

                            <div className="flex-1 w-full h-80 flex flex-col">
                                <h3 className="font-bold text-gray-700 mb-3 flex items-center justify-between">
                                    <span>Live Attendees</span>
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">{attendees.length} Present</span>
                                </h3>
                                <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 overflow-y-auto p-3 space-y-2">
                                    {attendees.map(att => (
                                        <div key={att.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">✓</div>
                                                <span className="font-medium text-gray-800">{att.student?.name}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">{new Date(att.created_at).toLocaleTimeString()}</span>
                                        </div>
                                    ))}
                                    {attendees.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                            <p className="animate-pulse">Waiting for scans...</p>
                                        </div>
                                    )}
                                </div>
                                <button onClick={endSession} className="mt-4 w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition border border-red-100">
                                    End Session
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW 4: STUDENTS */}
                {view === 'students' && <TeacherStudentDirectory />}
                
            </main>
        </div>
    );
}

// --- SUB COMPONENTS ---

function SidebarBtn({ icon, label, active, onClick, isLive }) {
    return (
        <button 
            onClick={onClick} 
            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${active 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                }
                ${isLive ? 'animate-pulse text-red-400 hover:text-red-300' : ''}
            `}
        >
            <span className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>{icon}</span>
            {label}
        </button>
    );
}

function StatCard({ label, value, icon, color }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}

function ClassCard({ cls, onStart }) {
    const [showReason, setShowReason] = useState(false);
    const [reason, setReason] = useState("");

    const markNoClass = async () => {
        try {
            await api.post('/teacher/no-class', { class_id: cls.id, reason });
            alert("Marked as 'No Class'. Students notified.");
            setShowReason(false);
        } catch (e) { alert("Error"); }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group">
            <div className="flex justify-between items-start mb-4">
                <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2 py-1 rounded uppercase border border-purple-100">{cls.course_code}</span>
            </div>
            <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-purple-600 transition">{cls.name}</h3>
            <p className="text-gray-500 text-sm mb-6 min-h-[40px] line-clamp-2">{cls.description || "No description provided."}</p>
            
            <div className="flex gap-2">
                <button onClick={onStart} className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-black transition shadow-lg text-sm">Start Class</button>
                <button onClick={() => setShowReason(true)} className="px-3 bg-red-50 text-red-500 rounded-lg font-medium hover:bg-red-100 border border-red-100">✕</button>
            </div>

            {/* No Class Modal */}
            {showReason && (
                <div className="absolute inset-0 bg-white/95 p-6 rounded-xl z-10 flex flex-col justify-center backdrop-blur-sm">
                    <p className="text-sm font-bold text-gray-700 mb-2">Reason for cancellation:</p>
                    <textarea className="w-full border p-2 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-red-500 outline-none" rows="2" placeholder="e.g. Sick leave" value={reason} onChange={e => setReason(e.target.value)}></textarea>
                    <div className="flex gap-2">
                        <button onClick={() => setShowReason(false)} className="flex-1 bg-gray-100 py-2 rounded-lg text-sm font-medium text-gray-600">Cancel</button>
                        <button onClick={markNoClass} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700">Confirm</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function TeacherStudentDirectory() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        // api.get('/teacher/students').then(res => setStudents(res.data));
        setStudents([
            {id: 1, name: "Alice Johnson", email: "alice@example.com"},
            {id: 2, name: "Bob Smith", email: "bob@example.com"}
        ]);
    }, []);

    const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Students</h1>
            <div className="relative mb-6">
                <input type="text" placeholder="Search students..." className="w-full border border-gray-200 p-3 pl-10 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 outline-none transition" value={search} onChange={e => setSearch(e.target.value)} />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {filtered.map(s => (
                    <div key={s.id} className="p-4 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 text-indigo-600 flex items-center justify-center font-bold">{s.name[0]}</div>
                            <div>
                                <p className="font-bold text-gray-800">{s.name}</p>
                                <p className="text-xs text-gray-500">{s.email}</p>
                            </div>
                        </div>
                        <button className="text-blue-600 text-sm font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition">Reset Password</button>
                    </div>
                ))}
                {filtered.length === 0 && <p className="p-8 text-center text-gray-400">No students found.</p>}
            </div>
        </div>
    );
}