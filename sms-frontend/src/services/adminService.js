import api from "../api/axios";

const adminService = {
    // --- DASHBOARD STATS ---
    getStats: async () => {
        // You'll need to create this endpoint in Laravel later, 
        // for now we can mock it or fetch raw lists
        return { teacherCount: 10, studentCount: 150, classCount: 5 };
    },

    // --- USER MANAGEMENT ---
    getUsers: async (role) => {
        // Assumes you have a generic route or filter in AdminController
        return api.get(`/admin/users?role=${role}`);
    },
    createUser: async (userData) => {
        return api.post('/admin/users', userData);
    },
    deleteUser: async (id) => {
        return api.delete(`/admin/users/${id}`);
    },

    // --- CLASS MANAGEMENT ---
    getClasses: async () => {
        return api.get('/admin/classes');
    },
    createClass: async (classData) => {
        return api.post('/admin/classes', classData);
    },
    assignStudent: async (classId, studentId) => {
        return api.post(`/admin/classes/${classId}/assign`, { student_id: studentId });
    }
};

export default adminService;