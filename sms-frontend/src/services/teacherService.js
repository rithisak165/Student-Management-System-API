import api from "../api/axios";

const teacherService = {
    // --- DASHBOARD & CLASSES ---
    getDashboardStats: async () => {
        const response = await api.get('/teacher/dashboard');
        return response.data;
    },
    
    getClasses: async () => { // Renamed from getMyClasses to match standard naming
        const response = await api.get('/teacher/classes');
        return response.data;
    },
    
    getMyStudents: async () => {
        const response = await api.get('/teacher/students');
        return response.data;
    },

    // --- SESSION MANAGEMENT ---
    startSession: (classId) => api.post('/teacher/session', { class_id: classId }), // Removed duration if not using it
    
    endSession: (sessionId) => api.post(`/teacher/session/${sessionId}/end`),

    getSessionAttendance: (sessionId) => api.get(`/teacher/session/${sessionId}/attendance`),
    
    markNoClass: (classId, date) => api.post('/teacher/no-class', { class_id: classId, date }),

    manualAttendance: (sessionId, studentId, status) => 
        api.post(`/teacher/attendance/update`, { session_id: sessionId, student_id: studentId, status }),
    
    getSessionHistory: async () => {
        const response = await api.get('/teacher/history');
        return response.data;
    },

    // --- PERMISSIONS (Updated) ---
    getPermissionRequests: async () => {
        // Matches Route::get('/teacher/permissions')
        const response = await api.get('/teacher/permissions');
        return response.data;
    },

    respondToRequest: async (id, status) => {
        // Matches Route::post('/teacher/permissions/{id}/respond')
        const response = await api.post(`/teacher/permissions/${id}/respond`, { status });
        return response.data;
    }
};

export default teacherService;