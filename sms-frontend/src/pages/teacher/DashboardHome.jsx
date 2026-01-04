import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function DashboardHome() {
    const { user } = useAuth();
    
    // --- State ---
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Student List State
    const [activeClass, setActiveClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [studentsLoading, setStudentsLoading] = useState(false);

    // Editing State
    const [editingStudentId, setEditingStudentId] = useState(null);
    const [tempStatus, setTempStatus] = useState("Present");

    // 1. Fetch Classes on Load
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const { data } = await api.get('/teacher/classes');
                setClasses(data);
            } catch (error) {
                console.error("Failed to fetch classes", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    // 2. Click "View Students" -> Fetch from API
    const handleViewStudents = async (cls) => {
        setActiveClass(cls);
        setSearchQuery("");
        setStudents([]); 
        setStudentsLoading(true);

        try {
            // Uses the NEW route: /teacher/classes/{id}/students
            const { data } = await api.get(`/teacher/classes/${cls.id}/students`);
            setStudents(data);
            
            // Scroll to section
            setTimeout(() => {
                document.getElementById("student-section")?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        } catch (error) {
            console.error("Failed to fetch students", error);
            alert("Could not load students.");
        } finally {
            setStudentsLoading(false);
        }
    };

    // 3. Click "Edit"
    const handleEditClick = (student) => {
        setEditingStudentId(student.id);
        // Use existing status or default to Present
        setTempStatus(student.status && student.status !== "Pending" ? student.status : "Present");
    };

    // 4. Click "Save" -> Update API
    const handleSaveStatus = async (studentId) => {
        try {
            // Uses the NEW route: /teacher/attendance/update
            await api.post('/teacher/attendance/update', {
                class_id: activeClass.id,
                student_id: studentId,
                status: tempStatus
            });

            // Update UI locally
            setStudents(students.map(s => 
                s.id === studentId ? { ...s, status: tempStatus } : s
            ));
            setEditingStudentId(null);
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to save attendance.");
        }
    };

    // Search Filter
    const filteredStudents = students.filter(student => 
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold">Welcome back, {user?.name}! 👋</h1>
                <p className="mt-2 text-indigo-100">Select a class below to check students.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Class List */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                    <h2 className="mb-4 text-lg font-bold text-gray-800">My Classes</h2>
                    <div className="space-y-4">
                        {loading ? <p>Loading classes...</p> : classes.map((cls) => (
                            <div 
                                key={cls.id} 
                                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4 cursor-pointer transition
                                ${activeClass?.id === cls.id ? "border-indigo-500 bg-indigo-50" : "border-gray-50 bg-gray-50 hover:bg-white hover:shadow-sm"}`}
                                onClick={() => handleViewStudents(cls)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">
                                        {cls.course_code?.substring(0, 2) || "CS"}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{cls.name}</h3>
                                        <span className="text-xs text-gray-500">{cls.course_code}</span>
                                    </div>
                                </div>
                                <button className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-600 hover:text-white transition">
                                    View Students
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-fit">
                    <h2 className="mb-4 text-lg font-bold text-gray-800">Quick Actions</h2>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 text-gray-600 hover:bg-yellow-50 transition">
                        <span className="bg-yellow-100 text-yellow-600 rounded-full w-8 h-8 flex items-center justify-center">📢</span>
                        Post Announcement
                    </button>
                </div>
            </div>

            {/* Student Table Section */}
            <div id="student-section" className="transition-all duration-500">
                {activeClass ? (
                    <div className="rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                        <div className="border-b border-gray-100 bg-gray-50 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Students in {activeClass.name}</h2>
                                <p className="text-sm text-gray-500">Total: {filteredStudents.length}</p>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search student..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="px-4 py-2 border rounded-lg w-full md:w-64"
                            />
                        </div>

                        <div className="overflow-x-auto">
                            {studentsLoading ? (
                                <div className="p-8 text-center text-gray-500">Loading students...</div>
                            ) : (
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                        <tr>
                                            <th className="px-6 py-3">Name</th>
                                            <th className="px-6 py-3">Email</th>
                                            <th className="px-6 py-3">Today's Status</th>
                                            <th className="px-6 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                                                <td className="px-6 py-4">{student.email}</td>
                                                
                                                {/* Status Column */}
                                                <td className="px-6 py-4">
                                                    {editingStudentId === student.id ? (
                                                        <select 
                                                            value={tempStatus} 
                                                            onChange={(e) => setTempStatus(e.target.value)}
                                                            className="border rounded p-1 text-sm bg-white"
                                                        >
                                                            <option value="Present">Present</option>
                                                            <option value="Absent">Absent</option>
                                                            <option value="Late">Late</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                                                            ${student.status === 'Present' ? 'bg-green-100 text-green-700' : 
                                                              student.status === 'Absent' ? 'bg-red-100 text-red-700' : 
                                                              student.status === 'Late' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                                            {student.status || "Pending"}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Action Column */}
                                                <td className="px-6 py-4 text-right">
                                                    {editingStudentId === student.id ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => handleSaveStatus(student.id)} className="text-green-600 font-bold hover:underline">Save</button>
                                                            <button onClick={() => setEditingStudentId(null)} className="text-gray-400 hover:text-gray-600">Cancel</button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => handleEditClick(student)} className="text-indigo-600 font-medium hover:text-indigo-900">Edit</button>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="4" className="p-8 text-center text-gray-400">No students found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-400 border-2 border-dashed rounded-xl bg-gray-50">
                        Select a class above to view the student list.
                    </div>
                )}
            </div>
        </div>
    );
}