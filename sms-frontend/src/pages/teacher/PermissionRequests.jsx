import { useState, useEffect } from "react";
import teacherService from "../../services/teacherService";
import { Check, X, Clock, User, BookOpen } from "lucide-react";

export default function PermissionRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const data = await teacherService.getPermissionRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to load permissions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        // 1. Optimistic Update (Remove from UI immediately)
        const previousRequests = [...requests];
        setRequests(requests.filter(r => r.id !== id));

        try {
            // 2. Call API
            await teacherService.respondToRequest(id, status);
        } catch (error) {
            console.error("Failed to update permission", error);
            // 3. Revert if failed
            setRequests(previousRequests);
            alert("Something went wrong. Please try again.");
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading requests...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            <h1 className="text-2xl font-bold text-gray-800">Permission Requests</h1>
            
            {requests.length === 0 ? (
                // EMPTY STATE
                <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                        <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">All Caught Up!</h3>
                    <p className="text-gray-500 mt-1">There are no pending requests to review.</p>
                    <button onClick={loadRequests} className="mt-4 text-sm text-indigo-600 font-medium hover:underline">Refresh</button>
                </div>
            ) : (
                // GRID OF CARDS
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requests.map(req => (
                        <div key={req.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            
                            {/* Header: Student Info */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        {req.student?.name?.charAt(0) || <User className="w-5 h-5"/>}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{req.student?.name || "Unknown Student"}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="w-3 h-3" /> {req.school_class?.name}
                                            </span>
                                            <span>•</span>
                                            <span>{req.time_ago}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border
                                    ${req.type === 'Sick Leave' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                    {req.type}
                                </span>
                            </div>
                            
                            {/* The Reason Note */}
                            <div className="bg-gray-50 p-3 rounded-lg mb-5 border border-gray-100">
                                <p className="text-gray-700 text-sm italic">"{req.reason}"</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => handleAction(req.id, 'rejected')}
                                    className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                >
                                    <X className="w-4 h-4" /> Reject
                                </button>
                                <button 
                                    onClick={() => handleAction(req.id, 'approved')}
                                    className="flex items-center justify-center gap-2 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                                >
                                    <Check className="w-4 h-4" /> Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}