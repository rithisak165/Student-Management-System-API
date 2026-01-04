import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      const res = await api.get(`/student/class/${id}`);
      setClassInfo(res.data);
    } catch (err) {
      setError("Failed to load class.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  const stats = classInfo.stats || {};
  const history = classInfo.my_attendance || [];

  // 🚨 IMPORTANT FLAGS
  const noClassToday = classInfo.today_status === "cancelled";
  const cancelReason = classInfo.cancel_reason;

  return (
    <div className="max-w-4xl mx-auto p-6">

      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-gray-500 hover:text-indigo-600"
      >
        ← Back
      </button>

      {/* HEADER */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-sm font-bold">
          {classInfo.course_code}
        </span>

        <h1 className="text-3xl font-bold mt-3">{classInfo.name}</h1>
        <p className="text-gray-500 mt-1">
          Instructor: <b>{classInfo.teacher?.name}</b>
        </p>
      </div>

      {/* TODAY SECTION */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-400 mb-3">
          TODAY'S CLASS ACTIVITY
        </h3>

        {noClassToday ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">📢</div>
            <h2 className="font-bold text-yellow-800 text-lg">
              No Class Today
            </h2>
            <p className="text-sm text-yellow-700 mt-2">
              {cancelReason || "Your instructor cancelled today's class."}
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-5">
            <div className="flex justify-between mb-2">
              <div>
                <span className="text-3xl font-bold">{stats.percentage || 0}%</span>
                <span className="text-gray-500 ml-2">Attendance</span>
              </div>
              <div className="text-right">
                <b>{stats.present_today || 0}</b> / {stats.total_students || 0}
                <div className="text-xs text-gray-400">Students Present</div>
              </div>
            </div>

            <div className="w-full bg-gray-200 h-3 rounded-full">
              <div
                className="h-3 bg-indigo-500 rounded-full"
                style={{ width: `${stats.percentage || 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* HISTORY */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b font-bold">My Attendance History</div>

        {history.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            No attendance records yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3">
                    {new Date(row.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 capitalize font-bold">
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
