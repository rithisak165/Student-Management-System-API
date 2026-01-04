import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useClass } from '../../context/ClassContext';
import axios from 'axios';

export default function StudentLayout() {
    // 1. Get Context Data
    const { currentClass } = useClass();
    const location = useLocation();
    const navigate = useNavigate();
    
    // 2. Local State for UI
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Get user from local storage (or useAuth if you have it set up for students)
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'Student' };

    // Helper to check active routes
    const isActive = (path) => location.pathname.includes(path);

    // 3. Logout Function
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            // Attempt to invalidate token on server
            if (token) {
                await axios.post('http://127.0.0.1:8000/api/logout', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error("Logout warning:", error);
        } finally {
            // Clear everything and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('currentClass');
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">

            {/* --- MOBILE OVERLAY (Closes sidebar when clicked) --- */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* --- SIDEBAR --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo Section */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h1 className="text-xl font-bold tracking-wider">SMS<span className="text-indigo-500">STUDENT</span></h1>
                    {/* Close button for mobile */}
                    <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    
                    {/* 1. DASHBOARD (Always Visible) */}
                    <SidebarLink
                        to="/student/dashboard"
                        label="My Classes"
                        icon="🏠"
                        active={location.pathname === '/student/dashboard'}
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* 2. CLASS SPECIFIC LINKS (Only if class selected) */}
                    {currentClass && (
                        <>
                            <div className="mt-6 mb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Current Class: <span className="text-indigo-400 block mt-1">{currentClass.course_code}</span>
                            </div>

                            <SidebarLink
                                to={`/student/class/${currentClass.id}`}
                                label="Overview"
                                icon="📊"
                                active={location.pathname === `/student/class/${currentClass.id}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                            <SidebarLink
                                to="/student/attendance"
                                label="Attendance"
                                icon="📅"
                                active={isActive('attendance')}
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                            <SidebarLink
                                to="/student/classmates"
                                label="Classmates"
                                icon="👥"
                                active={isActive('classmates')}
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                            <SidebarLink
                                to="/student/requests"
                                label="Requests"
                                icon="📝"
                                active={isActive('requests')}
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                        </>
                    )}
                </nav>

                {/* Footer / User Profile (Identical to Admin Design) */}
                <div className="p-4 bg-slate-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-sm">{user.name}</p>
                            <p className="text-slate-400 text-xs truncate">Student Account</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="w-full text-center text-xs text-red-400 hover:text-red-300 border border-transparent hover:border-red-900/50 py-1 rounded transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* --- CONTENT AREA --- */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                
                {/* Mobile Header */}
                <header className="bg-white shadow-sm p-4 flex items-center justify-between lg:hidden">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600 focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <span className="font-bold text-gray-700">Student Portal</span>
                    <div className="w-6"></div> {/* Spacer to center title */}
                </header>

                {/* Desktop Header */}
                <header className="hidden lg:flex bg-white shadow-sm p-4 justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700">
                            {currentClass ? currentClass.name : 'Student Dashboard'}
                        </h2>
                    </div>
                    <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

// Reusable Link Component (Same as Admin)
function SidebarLink({ to, label, icon, active, onClick }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition 
            ${active ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
            <span className="text-xl">{icon}</span>
            <span className="font-medium text-sm">{label}</span>
        </Link>
    );
}