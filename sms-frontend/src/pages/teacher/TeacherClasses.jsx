import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function TeacherClasses() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // State for Cancel Class Modal
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [submittingCancel, setSubmittingCancel] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const { data } = await api.get('/teacher/classes');
            setClasses(data);
        } catch (error) {
            console.error("Failed to load classes", error);
        } finally {
            setLoading(false);
        }
    };

    // 1. Launch Session Logic (Working)
    const handleLaunchSession = async (classId) => {
        try {
            const { data } = await api.post('/teacher/session', { class_id: classId });

            // Save to LocalStorage & Trigger Sidebar Update
            localStorage.setItem("activeSession", JSON.stringify(data));
            window.dispatchEvent(new Event("sessionUpdated"));

            navigate('/teacher/live', { state: { session: data } });
        } catch (error) {
            alert("Failed to start session. Check console.");
            console.error(error);
        }
    };

    // 2. Open Cancel Modal
    const openCancelModal = (classId) => {
        setSelectedClassId(classId);
        setCancelReason(""); // Reset reason
        setShowCancelModal(true);
    };

    // 3. Submit Cancellation (The part you need fixed)
    const handleConfirmCancel = async () => {
        if (!cancelReason.trim()) {
            alert("Please enter a reason for cancellation.");
            return;
        }

        setSubmittingCancel(true);
        try {
            // Sends 'class_id' and 'message' (backend expects 'message' or 'reason')
            await api.post('/teacher/no-class', {
                class_id: selectedClassId,
                message: cancelReason
            });

            alert("Class cancelled successfully.");
            setShowCancelModal(false); // Close modal
        } catch (error) {
            console.error("Failed to cancel class:", error);
            alert("Error cancelling class. Check console.");
        } finally {
            setSubmittingCancel(false);
        }
    };

    if (loading) return <div className="p-8">Loading classes...</div>;

    return (
        <div className="max-w-6xl mx-auto relative">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Classes</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls) => {

                    const isCancelledToday = cls.today_status === 'cancelled';
                    const hasActiveSession = cls.today_status === 'active';
                    return (
                        <div
                            key={cls.id}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">
                                        {cls.course_code || "CODE"}
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-900 mt-2">
                                        {cls.name}
                                    </h3>
                                </div>
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            </div>

                            <div className="flex gap-3 mt-6">
                                {/* Cancel Class */}
                                <button
                                    onClick={() => openCancelModal(cls.id)}
                                    disabled={isCancelledToday || hasActiveSession}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition
                        ${isCancelledToday
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-red-50 text-red-600 hover:bg-red-100'}
                        `}
                                >
                                    {isCancelledToday ? 'Class Cancelled' : 'Cancel Class'}
                                </button>

                                {/* Launch Session */}
                                <button
                                    onClick={() => handleLaunchSession(cls.id)}
                                    disabled={isCancelledToday}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm
                        ${isCancelledToday
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'}
                        `}
                                >
                                    {isCancelledToday ? 'No Class Today' : 'Launch Session'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>


            {/* --- CANCEL CLASS MODAL --- */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Cancel Class</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Please provide a reason. This will notify your students.
                        </p>

                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none mb-4"
                            rows="3"
                            placeholder="e.g. I am sick today..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                                disabled={submittingCancel}
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleConfirmCancel}
                                disabled={submittingCancel}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition flex items-center gap-2"
                            >
                                {submittingCancel ? "Submitting..." : "Confirm Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}