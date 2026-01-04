import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ManageUsers({ roleType }) {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);

    // Initial Form State
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        role: roleType, 
        student_id_number: '' 
    });

    // 1. Fetch Users on Load or Role Change
    useEffect(() => {
        setUsers([]); 
        setFormData(prev => ({ ...prev, role: roleType }));
        
        const fetchUsers = async () => {
            try {
                const { data } = await api.get(`/admin/users?role=${roleType}`);
                // Ensure data is an array before setting it
                setUsers(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to load users", error);
            }
        };
        fetchUsers();
    }, [roleType]);

    // 2. Reset Form Helper
    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', role: roleType, student_id_number: '' });
        setAvatarFile(null);
        setIsEditing(false);
        setEditId(null);
        setShowModal(false);
    };

    // 3. Handle Edit Button
    const handleEdit = (user) => {
        setIsEditing(true);
        setEditId(user.id);
        setFormData({
            name: user.name,
            email: user.email,
            password: '', 
            role: user.role,
            student_id_number: user.student_id_number || ''
        });
        setAvatarFile(null);
        setShowModal(true);
    };

    // 4. Handle Submit (Create or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('role', roleType);
        
        if (formData.student_id_number) {
            data.append('student_id_number', formData.student_id_number);
        }
        
        if (!isEditing && formData.password) {
            data.append('password', formData.password);
        }

        if (avatarFile) {
            data.append('avatar', avatarFile);
        }

        try {
            if (isEditing) {
                // --- UPDATE (PUT) ---
                data.append('_method', 'PUT'); 
                const response = await api.post(`/admin/users/${editId}`, data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                // 🟢 FIX 1: Safety Check for API Response
                const updatedUser = response.data.user || response.data;
                
                if (updatedUser && updatedUser.id) {
                    setUsers(users.map(u => u.id === editId ? updatedUser : u));
                    alert("User updated successfully!");
                    resetForm();
                } else {
                    // If API doesn't return the user, reload the list to be safe
                    window.location.reload(); 
                }

            } else {
                // --- CREATE (POST) ---
                const response = await api.post('/admin/users', data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                // 🟢 FIX 1: Safety Check for API Response
                // Sometimes Laravel returns { user: {...} }, sometimes just {...}
                const newUser = response.data.user || response.data;

                if (newUser && newUser.id) {
                    setUsers([newUser, ...users]); 
                    alert("User created successfully!");
                    resetForm();
                } else {
                    console.error("API did not return a valid user object:", response.data);
                    alert("User created, but response was unexpected. Reloading...");
                    window.location.reload(); // Reload to fetch correct data and prevent crash
                }
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Failed to save user.";
            alert(msg);
        }
    };

    // 5. Handle Delete
    const handleDelete = async (id) => {
        if(!confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            alert("Failed to delete user");
        }
    };

    const title = roleType === 'teacher' ? 'Teacher Management' : 'Student Management';

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                <button 
                    onClick={() => { resetForm(); setShowModal(true); }} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm"
                >
                    + Add New {roleType === 'teacher' ? 'Teacher' : 'Student'}
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4">Avatar</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                {roleType === 'student' && <th className="p-4">Student ID</th>}
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(user => {
                                // 🟢 Safety Check: Ensure user exists before rendering
                                if (!user) return null; 
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            {user.avatar ? (
                                                <img src={`http://localhost:8000/storage/${user.avatar}`} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 font-medium text-gray-900">{user.name}</td>
                                        <td className="p-4 text-gray-500">{user.email}</td>
                                        {roleType === 'student' && <td className="p-4 text-gray-500 font-mono">{user.student_id_number || '-'}</td>}
                                        <td className="p-4 text-right space-x-2">
                                            <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                                            <span className="text-gray-300">|</span>
                                            <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {users.length === 0 && (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-400">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">
                            {isEditing ? 'Edit User' : `Add New ${roleType === 'teacher' ? 'Teacher' : 'Student'}`}
                        </h3>
                        
                        {/* 🟢 FIX 2: autoComplete="off" prevents browser autofill */}
                        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                            
                            {/* Fake fields to trick chrome autofill logic if the simple fix doesn't work */}
                            <input type="email" style={{display: 'none'}} />
                            <input type="password" style={{display: 'none'}} />

                            {/* Photo */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Profile Photo</label>
                                <input type="file" accept="image/*" className="w-full border p-2 rounded mt-1 text-sm"
                                    onChange={(e) => setAvatarFile(e.target.files[0])} 
                                />
                                {isEditing && <p className="text-xs text-gray-400 mt-1">Leave blank to keep current photo.</p>}
                            </div>

                            {/* Name */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                                <input type="text" className="w-full border p-2 rounded mt-1" required 
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            
                            {/* Email */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                                {/* 🟢 FIX 2: autoComplete="new-password" on email sometimes helps too */}
                                <input 
                                    type="email" 
                                    className="w-full border p-2 rounded mt-1" 
                                    required 
                                    autoComplete="off"
                                    value={formData.email} 
                                    onChange={e => setFormData({...formData, email: e.target.value})} 
                                />
                            </div>

                            {/* Password */}
                            {!isEditing && (
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                                    {/* 🟢 FIX 2: autoComplete="new-password" forces browser to ignore saved passwords */}
                                    <input 
                                        type="password" 
                                        className="w-full border p-2 rounded mt-1" 
                                        required 
                                        autoComplete="new-password"
                                        value={formData.password} 
                                        onChange={e => setFormData({...formData, password: e.target.value})} 
                                    />
                                </div>
                            )}

                            {/* Student ID */}
                            {roleType === 'student' && (
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Student ID Number</label>
                                    <input type="text" className="w-full border p-2 rounded mt-1" required 
                                        value={formData.student_id_number} onChange={e => setFormData({...formData, student_id_number: e.target.value})} />
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={resetForm} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                                    {isEditing ? 'Save Changes' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}