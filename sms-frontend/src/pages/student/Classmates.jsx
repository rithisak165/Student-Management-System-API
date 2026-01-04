import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useClass } from "../../context/ClassContext";

export default function Classmates() {
  const { currentClass } = useClass();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // STATE TO MANAGE OPEN MODAL
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (!currentClass) return;

    setLoading(true);
    api
      .get(`/student/class/${currentClass.id}/classmates`)
      .then(res => setStudents(res.data))
      .finally(() => setLoading(false));
  }, [currentClass]);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading classmates...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {students.map(s => (
          <div
            key={s.id}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-100"
          >
            {/* FULL-WIDTH HEADER IMAGE */}
            <div className="relative h-56 overflow-hidden">
              <img
                src={s.avatar}
                alt={s.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {e.target.src = 'https://ui-avatars.com/api/?name=' + s.name}} // Fallback
              />
              
              {/* GRADIENT OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              {/* STUDENT ID BADGE */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                <span className="text-sm font-bold text-gray-800">
                  #{s.id.toString().padStart(3, '0')}
                </span>
              </div>
              
              {/* NAME OVERLAY */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                  {s.name}
                </h3>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-white/80 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-white/90 truncate">
                    {s.email}
                  </p>
                </div>
              </div>
            </div>

            {/* CONTENT SECTION */}
            <div className="p-6">
              {/* STATUS INDICATOR */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${s.stats?.present > s.stats?.absent ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {s.stats?.present > s.stats?.absent ? 'Regular Attendee' : 'Irregular Attendance'}
                  </span>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-gray-500">Attendance Score</p>
                  <p className="text-lg font-bold text-gray-900">
                    {s.stats?.present || s.stats?.absent || s.stats?.permission ? 
                      Math.round(((s.stats?.present ?? 0) / ((s.stats?.present ?? 0) + (s.stats?.absent ?? 0) + (s.stats?.permission ?? 0))) * 100) : 0
                    }<span className="text-sm text-gray-500">%</span>
                  </p>
                </div>
              </div>

              {/* ATTENDANCE STATS */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Attendance Breakdown</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-700 mb-1">
                      {s.stats?.present ?? 0}
                    </div>
                    <p className="text-xs font-semibold text-green-800">Present</p>
                    <p className="text-xs text-green-600 mt-1">On time</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-red-700 mb-1">
                      {s.stats?.absent ?? 0}
                    </div>
                    <p className="text-xs font-semibold text-red-800">Absent</p>
                    <p className="text-xs text-red-600 mt-1">Missed</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700 mb-1">
                      {s.stats?.permission ?? 0}
                    </div>
                    <p className="text-xs font-semibold text-blue-800">Permit</p>
                    <p className="text-xs text-blue-600 mt-1">Approved</p>
                  </div>
                </div>
              </div>

              {/* ATTENDANCE PROGRESS BAR */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Overall Attendance</span>
                  <span>
                    {s.stats?.present ?? 0} / {((s.stats?.present ?? 0) + (s.stats?.absent ?? 0) + (s.stats?.permission ?? 0))}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-full"
                    style={{
                      width: `${s.stats?.present || s.stats?.absent || s.stats?.permission ? 
                        Math.round(((s.stats?.present ?? 0) / ((s.stats?.present ?? 0) + (s.stats?.absent ?? 0) + (s.stats?.permission ?? 0))) * 100) : 0
                      }%`
                    }}
                  ></div>
                </div>
              </div>

              {/* ACTION BUTTON - CLICK OPENS MODAL */}
              <button 
                onClick={() => setSelectedStudent(s)}
                className="w-full py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-medium rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-200 shadow hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
              >
                View Full Profile
              </button>
            </div>
          </div>
        ))}

        {students.length === 0 && (
          <div className="col-span-full text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">No classmates found</h3>
            <p className="text-gray-500 max-w-md mx-auto text-lg">
              This class doesn't have any enrolled students yet.
            </p>
          </div>
        )}
      </div>

      {/* RENDER MODAL IF STUDENT SELECTED */}
      {selectedStudent && (
        <StudentProfileModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
          currentClass={currentClass}
        />
      )}
    </>
  );
}

// --- INTERNAL COMPONENT: MODAL ---
const StudentProfileModal = ({ student, show, onClose, currentClass }) => {
  const [imageFailed, setImageFailed] = useState(false);

  // Real Data Calculations
  const stats = student.stats || {};
  const present = stats.present || 0;
  const absent = stats.absent || 0;
  const permission = stats.permission || 0;
  const totalClasses = present + absent + permission;
  
  const attendancePercentage = totalClasses > 0 
    ? Math.round((present / totalClasses) * 100) 
    : 0;

  return (
    <>
      {/* BACKDROP */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* MODAL WINDOW */}
      <div className="fixed inset-0 z-[1000] overflow-y-auto pointer-events-none">
        <div className="flex min-h-full items-center justify-center p-4 pointer-events-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* HEADER WITH IMAGE */}
            <div className="relative h-64 bg-gray-900">
                {!imageFailed ? (
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-full h-full object-cover opacity-90"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-600">
                     <span className="text-8xl font-bold text-white/20 select-none">
                        {student.name?.charAt(0).toUpperCase()}
                     </span>
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                {/* Close Button */}
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 backdrop-blur-md transition-all z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                {/* Name & ID */}
                <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">{student.name}</h2>
                    <div className="flex items-center text-gray-300 space-x-4 text-sm">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-white backdrop-blur-sm">ID: #{student.id?.toString().padStart(6, '0')}</span>
                        <span>{student.email}</span>
                        {currentClass && <span>• Semester {currentClass.semester}</span>}
                    </div>
                </div>
            </div>

            {/* BODY CONTENT */}
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                
                {/* LEFT: Stats Cards */}
                <div className="md:col-span-2 space-y-6">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Attendance Breakdown</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {/* Present */}
                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-center">
                        <div className="text-3xl font-bold text-green-600">{present}</div>
                        <div className="text-xs font-semibold uppercase text-green-800 mt-1">Present</div>
                    </div>
                    {/* Absent */}
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center">
                        <div className="text-3xl font-bold text-red-600">{absent}</div>
                        <div className="text-xs font-semibold uppercase text-red-800 mt-1">Absent</div>
                    </div>
                    {/* Permission */}
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
                        <div className="text-3xl font-bold text-blue-600">{permission}</div>
                        <div className="text-xs font-semibold uppercase text-blue-800 mt-1">Permit</div>
                    </div>
                  </div>

                  {/* Progress Bar Detail */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-gray-600">Total Classes: {totalClasses}</span>
                        <div className="flex items-center">
                            <span className={`text-2xl font-bold ${attendancePercentage > 75 ? 'text-green-600' : 'text-amber-600'}`}>{attendancePercentage}%</span>
                            <span className="text-xs text-gray-400 ml-1">Attend. Rate</span>
                        </div>
                    </div>
                    <div className="flex w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                        {totalClasses > 0 ? (
                           <>
                             <div style={{ width: `${(present/totalClasses)*100}%` }} className="bg-green-500 h-full" title="Present"></div>
                             <div style={{ width: `${(permission/totalClasses)*100}%` }} className="bg-blue-500 h-full" title="Permission"></div>
                             <div style={{ width: `${(absent/totalClasses)*100}%` }} className="bg-red-500 h-full" title="Absent"></div>
                           </>
                        ) : (
                            <div className="w-full h-full bg-gray-200"></div>
                        )}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>Present</div>
                        <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>Permission</div>
                        <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>Absent</div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Quick Summary / Actions */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Status</h3>
                    
                    <div className={`p-6 rounded-xl text-center ${present > absent ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <div className={`text-xl font-bold ${present > absent ? 'text-green-700' : 'text-red-700'}`}>
                            {present > absent ? 'Good Standing' : 'At Risk'}
                        </div>
                        <p className={`text-sm mt-1 ${present > absent ? 'text-green-600' : 'text-red-600'}`}>
                            {present > absent ? 'Keep up the good work!' : 'Attendance needs improvement.'}
                        </p>
                    </div>

                    <div className="pt-4 space-y-3">
                         <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-200">
                             Send Message
                         </button>
                         <button 
                            onClick={onClose}
                            className="w-full py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
                         >
                             Close Profile
                         </button>
                    </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};