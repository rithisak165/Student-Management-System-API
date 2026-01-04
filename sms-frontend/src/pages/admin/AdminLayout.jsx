import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

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
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h1 className="text-xl font-bold tracking-wider">SMS<span className="text-blue-500">ADMIN</span></h1>
                    {/* Close button for mobile */}
                    <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <SidebarLink
                        to="/admin"
                        label="Dashboard"
                        icon="📊"
                        active={isActive('/admin')}
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* --- NEW SEPARATE LINKS --- */}
                    <SidebarLink
                        to="/admin/teachers"
                        label="Manage Teachers"
                        icon="👨‍🏫"
                        active={isActive('/admin/teachers')}
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    <SidebarLink
                        to="/admin/students"
                        label="Manage Students"
                        icon="🎓"
                        active={isActive('/admin/students')}
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    {/* --------------------------- */}

                    <SidebarLink
                        to="/admin/classes"
                        label="Manage Classes"
                        icon="🏫"
                        active={isActive('/admin/classes')}
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <SidebarLink
                        to="/admin/reports"
                        label="Attendance Reports"
                        icon="📈"
                        active={isActive('/admin/reports')}
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <SidebarLink
                            to="/admin/help"
                            label="How to Use System"
                            icon="❓"
                            active={isActive('/admin/help')}
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                    </div>
                </nav>

                <div className="p-4 bg-slate-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">A</div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{user?.name}</p>
                            <p className="text-slate-400 text-xs truncate">Administrator</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full text-center text-xs text-red-400 hover:text-red-300">Sign Out</button>
                </div>
            </aside>

            {/* --- CONTENT AREA --- */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="bg-white shadow-sm p-4 flex items-center justify-between lg:hidden">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600 focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <span className="font-bold text-gray-700">Admin Portal</span>
                    <div className="w-6"></div> {/* Spacer to center title */}
                </header>

                {/* Desktop Header */}
                <header className="hidden lg:flex bg-white shadow-sm p-4 justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-700">Admin Portal</h2>
                    <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

function SidebarLink({ to, label, icon, active, onClick }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition 
            ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
            <span className="text-xl">{icon}</span>
            <span className="font-medium">{label}</span>
        </Link>
    );
}