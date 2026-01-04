export default function AdminHelp() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Administrator Guide</h1>
                    <p className="text-gray-500">How to manage the Student Management System</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Section 1: Users */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="bg-gray-100 px-2 py-1 rounded text-sm">1</span> 
                        Managing Users
                    </h2>
                    <p className="text-gray-600 mb-4">Before anything else, you must create accounts for Teachers and Students.</p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        <li>Go to <strong>"Manage Users"</strong> in the sidebar.</li>
                        <li>Click the blue <strong>"+ Add User"</strong> button.</li>
                        <li>Select the role (Teacher or Student).</li>
                        <li>For Students, you must provide a unique <strong>Student ID</strong>.</li>
                        <li>The default password for new accounts is whatever you type in the box.</li>
                    </ul>
                </section>

                {/* Section 2: Classes */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="bg-gray-100 px-2 py-1 rounded text-sm">2</span> 
                        Creating Classes
                    </h2>
                    <p className="text-gray-600 mb-4">Once you have Teachers, you can assign them to Classes.</p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        <li>Go to <strong>"Manage Classes"</strong>.</li>
                        <li>Click <strong>"+ Add Class"</strong>.</li>
                        <li>Enter the Subject Name (e.g., "Physics") and Course Code (e.g., "PHY101").</li>
                        <li><strong>Select a Teacher</strong> from the dropdown list.</li>
                        <li>Once created, the Teacher will see this class on their dashboard immediately.</li>
                    </ul>
                </section>

                {/* Section 3: Attendance */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="bg-gray-100 px-2 py-1 rounded text-sm">3</span> 
                        Monitoring Attendance
                    </h2>
                    <p className="text-gray-600">
                        Teachers start sessions and Students scan QR codes. As an Admin, you can view the raw data.
                        Go to <strong>"Attendance Reports"</strong> to see who was present, absent, or late for any class session.
                    </p>
                </section>
            </div>
        </div>
    );
}