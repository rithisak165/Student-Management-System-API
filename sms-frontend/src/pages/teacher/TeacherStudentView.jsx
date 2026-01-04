import { useEffect, useState } from "react";
import api from "../../api/axios";

/* ===================== STUDENT CARD ===================== */
const StudentCard = ({ student }) => {
  const avatarUrl = student.avatar
    ? student.avatar.startsWith("http")
      ? student.avatar
      : `http://127.0.0.1:8000/storage/${student.avatar}`
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden flex flex-col">
      <div className="h-24 bg-gradient-to-r from-indigo-500 to-blue-500"></div>

      <div className="flex justify-center -mt-12">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={student.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow bg-white"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 border-4 border-white">
            {student.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="p-4 text-center flex-1">
        <h3 className="text-lg font-bold text-gray-800">{student.name}</h3>
        <p className="text-sm text-gray-500">{student.email}</p>
      </div>

      <div className="grid grid-cols-3 border-t bg-gray-50 text-center">
        <div className="py-3">
          <p className="text-xs text-gray-400">Present</p>
          <p className="font-bold text-green-600">
            {student.attendance?.present ?? 0}
          </p>
        </div>
        <div className="py-3 border-x">
          <p className="text-xs text-gray-400">Absent</p>
          <p className="font-bold text-red-500">
            {student.attendance?.absent ?? 0}
          </p>
        </div>
        <div className="py-3">
          <p className="text-xs text-gray-400">Permit</p>
          <p className="font-bold text-blue-500">
            {student.attendance?.permit ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ===================== CLASS CARD (BUTTON RESTORED) ===================== */
const ClassCard = ({ classItem, onClick }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
    <div>
      <h3 className="text-xl font-bold text-gray-800">{classItem.name}</h3>
      <p className="text-sm text-gray-500 mt-1">
        {classItem.description || "No description"}
      </p>
    </div>

    {/* 🔥 VIEW STUDENTS BUTTON (RESTORED) */}
    <button
      onClick={() => onClick(classItem)}
      className="mt-6 w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
    >
      View Students
    </button>
  </div>
);

/* ===================== MAIN PAGE ===================== */
export default function TeacherStudentView() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/teacher/my-classes-list")
      .then((res) => setClasses(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;

    setLoading(true);
    api
      .get(`/teacher/class-students/${selectedClass.id}`)
      .then((res) => setStudents(res.data))
      .finally(() => setLoading(false));
  }, [selectedClass]);

  if (loading && !selectedClass) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        {selectedClass ? selectedClass.name : "My Classes"}
      </h1>

      {!selectedClass && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <ClassCard
              key={cls.id}
              classItem={cls}
              onClick={setSelectedClass}
            />
          ))}
        </div>
      )}

      {selectedClass && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {students.map((stu) => (
            <StudentCard key={stu.id} student={stu} />
          ))}
        </div>
      )}
    </div>
  );
}
