import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";

export default function ManageClasses() {
    // Data State
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]); 
    
    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [studentSearchTerm, setStudentSearchTerm] = useState(""); // NEW: Search state

    // Form State
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [selectedStudentIds, setSelectedStudentIds] = useState([]); 

    // Fetch Data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [classRes, teacherRes, studentRes] = await Promise.all([
                api.get('/admin/classes'),
                api.get('/admin/teachers'),
                api.get('/admin/users?role=student')
            ]);
            setClasses(classRes.data);
            setTeachers(teacherRes.data);
            setStudents(studentRes.data);
        } catch (error) {
            console.error("Error loading data", error);
            // Optional: set an error state here
        } finally {
            setIsLoading(false);
        }
    };

    // Filter Students based on Search Term
    const filteredStudents = useMemo(() => {
        return students.filter(s => 
            s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) || 
            s.email.toLowerCase().includes(studentSearchTerm.toLowerCase())
        );
    }, [students, studentSearchTerm]);

    // Open Modal Handlers
    const handleEditClick = (cls) => {
        setEditingClass(cls);
        setName(cls.name);
        setCode(cls.course_code);
        setTeacherId(cls.teacher_id);
        setSelectedStudentIds(cls.students ? cls.students.map(s => s.id) : []);
        setStudentSearchTerm(""); // Reset search
        setIsModalOpen(true);
    };

    const handleCreateClick = () => {
        setEditingClass(null);
        setName("");
        setCode("");
        setTeacherId("");
        setSelectedStudentIds([]);
        setStudentSearchTerm(""); // Reset search
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name,
                course_code: code,
                teacher_id: teacherId,
                student_ids: selectedStudentIds
            };

            if (editingClass) {
                await api.put(`/admin/classes/${editingClass.id}`, payload);
            } else {
                await api.post('/admin/classes', payload);
            }

            fetchData();
            setIsModalOpen(false);
        } catch (e) {
            alert("Error saving class");
        }
    };

    const toggleStudent = (id) => {
        if (selectedStudentIds.includes(id)) {
            setSelectedStudentIds(selectedStudentIds.filter(sId => sId !== id));
        } else {
            setSelectedStudentIds([...selectedStudentIds, id]);
        }
    };

    if (isLoading) {
        return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;
    }

    return (
        <div>
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
                    <p className="text-gray-500 text-sm">Assign teachers and enroll students</p>
                </div>
                <button 
                    onClick={handleCreateClick} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Class
                </button>
            </div>

            {/* Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(cls => (
                    <div key={cls.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                        
                        <div className="flex justify-between items-start mb-3">
                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                                {cls.course_code}
                            </span>
                            <div className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                {cls.students_count || cls.students?.length || 0} Students
                            </div>
                        </div>

                        <h3 className="font-bold text-xl text-gray-800 mb-1">{cls.name}</h3>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                {cls.teacher?.name?.[0] || "?"}
                            </div>
                            {cls.teacher?.name || "No Teacher Assigned"}
                        </div>

                        <button 
                            onClick={() => handleEditClick(cls)}
                            className="w-full py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:text-indigo-600 transition flex items-center justify-center gap-2"
                        >
                            Manage Class
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl w-full max-w-md space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h2 className="font-bold text-xl text-gray-800">
                                {editingClass ? "Edit Class Details" : "Create New Class"}
                            </h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        
                        {/* Inputs */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class Name</label>
                                <input className="w-full border p-2 rounded outline-none focus:border-indigo-500" placeholder="e.g. Physics 101" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Course Code</label>
                                <input className="w-full border p-2 rounded outline-none focus:border-indigo-500" placeholder="e.g. PHY101" value={code} onChange={e => setCode(e.target.value)} required />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assigned Teacher</label>
                            <select className="w-full border p-2 rounded bg-white outline-none focus:border-indigo-500" value={teacherId} onChange={e => setTeacherId(e.target.value)} required>
                                <option value="">-- Select Teacher --</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>

                        {/* Student Selection with Search */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex justify-between items-end mb-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase">Enroll Students</label>
                                <span className="text-xs text-indigo-600 font-medium">{selectedStudentIds.length} Selected</span>
                            </div>
                            
                            {/* Search Bar */}
                            <input 
                                type="text" 
                                placeholder="Search students by name..." 
                                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                                value={studentSearchTerm}
                                onChange={(e) => setStudentSearchTerm(e.target.value)}
                            />

                            <div className="border rounded-lg h-48 overflow-y-auto p-2 bg-gray-50">
                                {filteredStudents.length === 0 ? (
                                    <p className="text-gray-400 text-sm text-center mt-10">No students found.</p>
                                ) : (
                                    filteredStudents.map(student => (
                                        <div 
                                            key={student.id} 
                                            className={`flex items-center gap-3 mb-1 p-2 rounded-lg cursor-pointer transition
                                                ${selectedStudentIds.includes(student.id) ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-white border border-transparent'}`} 
                                            onClick={() => toggleStudent(student.id)}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${selectedStudentIds.includes(student.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}>
                                                {selectedStudentIds.includes(student.id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{student.name}</p>
                                                <p className="text-xs text-gray-500">{student.email}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Cancel</button>
                            <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 shadow-md">
                                {editingClass ? "Update Class" : "Create Class"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}