import api from "../api/axios";

const studentService = {
  // --- DASHBOARD & CLASSES ---
  getDashboardStats: async () => {
    const response = await api.get("/student/dashboard-stats");
    return response.data;
  },

  getEnrolledClasses: async () => {
    const response = await api.get("/student/classes");
    return response.data;
  },

  // --- ATTENDANCE (Existing) ---
  markAttendance: async (code) => {
    try {
      const response = await api.post("/student/attendance/scan", { code });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAttendanceHistory: async () => {
    try {
      const response = await api.get("/student/attendance/history");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // --- REQUESTS / PERMISSIONS (New) ---
  submitRequest: async (data) => {
    // data = { class_id, type, reason }
    const response = await api.post("/student/request", data);
    return response.data;
  },

  getRequests: async () => {
    const response = await api.get("/student/requests");
    return response.data;
  },
};

export default studentService;