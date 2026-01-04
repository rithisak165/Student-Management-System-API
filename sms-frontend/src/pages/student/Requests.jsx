import React, { useEffect, useState } from "react";
import studentService from '../../services/studentService';
import { Send, Clock, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [classes, setClasses] = useState([]);
  
  // Form State
  const [selectedClass, setSelectedClass] = useState("");
  const [type, setType] = useState("Sick Leave");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Fetch History
    studentService.getRequests()
      .then(setRequests)
      .catch(err => console.error("History error:", err));

    // 2. Fetch Classes for Dropdown
    studentService.getEnrolledClasses()
      .then((data) => {
        setClasses(data);
        // Default to first class if available
        if (data.length > 0) setSelectedClass(data[0].id);
      })
      .catch(err => console.error("Classes error:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass) return alert("Please select a class.");

    setLoading(true);
    try {
      const response = await studentService.submitRequest({ 
        class_id: selectedClass, 
        type, 
        reason 
      });

      // Add new request to top of list immediately
      const newReq = {
        ...response.data,
        school_class: classes.find(c => c.id == selectedClass), // Mock for display
        created_at: new Date().toISOString() // Mock date
      };
      
      setRequests([newReq, ...requests]);
      setReason(""); // Reset form
      alert("Request sent successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to send request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
      
      {/* LEFT: Submission Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Send className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">New Request</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Class Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)} 
              className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            >
              <option value="" disabled>Choose a class...</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name} ({cls.course_code})</option>
              ))}
            </select>
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)} 
              className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-2 focus:ring-blue-500"
            >
              <option>Sick Leave</option>
              <option>Personal Emergency</option>
              <option>Late Arrival</option>
              <option>Other</option>
            </select>
          </div>

          {/* Reason Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Note</label>
            <textarea 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              rows="4" 
              required 
              placeholder="Explain why you need this permission..."
              className="w-full border-gray-300 rounded-lg shadow-sm p-3 border focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition-all flex justify-center items-center gap-2"
          >
            {loading ? "Sending..." : "Submit Request"}
            {!loading && <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>

      {/* RIGHT: History List */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Request History</h2>
        </div>

        <div className="space-y-4">
          {requests.length === 0 && (
            <p className="text-gray-400 italic text-center py-10">No requests sent yet.</p>
          )}

          {requests.map((req) => (
            <div key={req.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-800">{req.type}</h3>
                  <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">
                    {req.school_class?.name || "Class #" + req.class_id}
                  </p>
                </div>
                {/* Status Badge */}
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold capitalize border
                  ${req.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' : 
                    req.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 
                    'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                  {req.status === 'approved' && <CheckCircle className="w-3 h-3"/>}
                  {req.status === 'rejected' && <XCircle className="w-3 h-3"/>}
                  {req.status === 'pending' && <AlertCircle className="w-3 h-3"/>}
                  {req.status}
                </span>
              </div>
              
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                 <Clock className="w-3 h-3" /> {new Date(req.created_at).toLocaleDateString()}
              </p>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 italic">"{req.reason}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}