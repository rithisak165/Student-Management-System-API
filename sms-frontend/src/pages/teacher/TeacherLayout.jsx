import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function TeacherLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // 1. STATE: Check if a session exists in storage right now
    const [hasActiveSession, setHasActiveSession] = useState(() => {
        return !!localStorage.getItem("activeSession");
    });

    const isActive = (path) => location.pathname === path;

    // 2. EFFECT: Listen for session changes (Launch or End)
    useEffect(() => {
        // Function to check storage
        const checkSession = () => {
            const sessionData = localStorage.getItem("activeSession");
            setHasActiveSession(!!sessionData);
        };

        // Listen for our custom event "sessionUpdated"
        window.addEventListener("sessionUpdated", checkSession);
        
        // Also listen for storage changes (in case of tab switching)
        window.addEventListener("storage", checkSession);

        return () => {
            window.removeEventListener("sessionUpdated", checkSession);
            window.removeEventListener("storage", checkSession);
        };
    }, []);

    // 3. AUTO-REDIRECT: If they try to go to live but no session exists
    useEffect(() => {
        if (location.pathname === '/teacher/live' && !hasActiveSession) {
            navigate('/teacher/classes');
        }
    }, [location.pathname, hasActiveSession, navigate]);

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* SIDEBAR */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0
            `}>
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold tracking-tight">Teacher<span className="text-indigo-400">Hub</span></span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400">✕</button>
                </div>

                <div className="p-6 pb-2">
                    <div className="flex items-center gap-3 mb-6 bg-slate-800 p-3 rounded-xl border border-slate-700">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-lg">
                            {user?.name?.[0] || "T"}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400">Instructor</p>
                        </div>
                    </div>
                </div>

                <nav className="px-4 space-y-1">
                    <SidebarLink to="/teacher" label="Dashboard" icon="📊" active={isActive('/teacher')} />
                    <SidebarLink to="/teacher/classes" label="My Classes" icon="📚" active={isActive('/teacher/classes')} />
                    
                    {/* --- NEW: View Students Link --- */}
                    <SidebarLink to="/teacher/view-students" label="All Students" icon="👥" active={isActive('/teacher/view-students')} />
                    
                    {/* 4. CONDITIONAL RENDER: Only show if session is active */}
                    {hasActiveSession && (
                        <div className="animate-pulse">
                            <SidebarLink 
                                to="/teacher/live" 
                                label="Live Session" 
                                icon="🔴" 
                                active={isActive('/teacher/live')} 
                            />
                        </div>
                    )}

                    <SidebarLink to="/teacher/permissions" label="Requests" icon="🔔" active={isActive('/teacher/permissions')} />
                    <SidebarLink to="/teacher/history" label="History" icon="🕒" active={isActive('/teacher/history')} />
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
                    <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-red-400 hover:bg-slate-800 py-2 rounded-lg transition text-sm font-medium">
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT OUTLET */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white border-b border-gray-200 p-4 md:hidden flex justify-between items-center shadow-sm z-10">
                    <div className="font-bold text-gray-800">Teacher Portal</div>
                    <button onClick={() => setMobileMenuOpen(true)} className="text-gray-600">☰</button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

function SidebarLink({ to, label, icon, active }) {
    return (
        <Link to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span className="text-lg">{icon}</span>
            {label}
        </Link>
    );
}