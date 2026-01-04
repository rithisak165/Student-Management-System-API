import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import for navigation
import api from "../../api/axios";

export default function AdminDashboard() {
  const navigate = useNavigate(); // 2. Initialize navigation hook

  // 3. Initialize state with YOUR backend variable names
  const [stats, setStats] = useState({
    studentCount: 0,
    teacherCount: 0,
    classCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 4. CHECK YOUR URL:
        // If your route in Laravel is inside a group prefix 'admin', use '/admin/stats'
        // If it is just Route::get('/stats'), use '/stats'
        const response = await api.get('/admin/stats'); 
        console.log("Stats from API:", response.data); 
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Total Students */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition hover:shadow-md">
          <div className="p-4 bg-blue-100 rounded-full text-blue-600 text-2xl mr-4">🎓</div>
          <div>
            <p className="text-gray-500 text-sm font-bold uppercase">Total Students</p>
            {/* 5. Use the backend key: studentCount */}
            <h3 className="text-3xl font-bold text-gray-800">{stats.studentCount}</h3>
          </div>
        </div>

        {/* Total Teachers */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition hover:shadow-md">
          <div className="p-4 bg-green-100 rounded-full text-green-600 text-2xl mr-4">👨‍🏫</div>
          <div>
            <p className="text-gray-500 text-sm font-bold uppercase">Total Teachers</p>
            {/* 6. Use the backend key: teacherCount */}
            <h3 className="text-3xl font-bold text-gray-800">{stats.teacherCount}</h3>
          </div>
        </div>

        {/* Total Classes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition hover:shadow-md">
          <div className="p-4 bg-purple-100 rounded-full text-purple-600 text-2xl mr-4">📚</div>
          <div>
            <p className="text-gray-500 text-sm font-bold uppercase">Active Classes</p>
            {/* 7. Use the backend key: classCount */}
            <h3 className="text-3xl font-bold text-gray-800">{stats.classCount}</h3>
          </div>
        </div>
      </div>

      {/* --- QUICK ACTIONS --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex gap-4">
            {/* 8. Fix Buttons using navigate() */}
            <button 
                onClick={() => navigate('/admin/students')} 
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
                Add New Student
            </button>
            <button 
                onClick={() => navigate('/admin/classes')}
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
            >
                Create Class
            </button>
        </div>
      </div>
    </div>
  );
}