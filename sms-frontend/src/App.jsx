import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login"; 
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Imports
import AdminLayout from "./pages/admin/AdminLayout";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageClasses from "./pages/admin/ManageClasses";
import AdminHelp from "./pages/admin/AdminHelp";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AttendanceReports from "./pages/admin/AttendanceReports";

// Teacher Imports
import TeacherLayout from "./pages/teacher/TeacherLayout";
import DashboardHome from "./pages/teacher/DashboardHome";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import LiveSession from "./pages/teacher/LiveSession";
import PermissionRequests from "./pages/teacher/PermissionRequests";
import SessionHistory from "./pages/teacher/SessionHistory";
import TeacherStudentView from "./pages/teacher/TeacherStudentView";

// Student Imports
import StudentLayout from "./pages/student/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import Classmates from "./pages/student/Classmates";
import Attendance from "./pages/student/Attendance";
import Requests from "./pages/student/Requests";
import StudentProfile from "./pages/student/StudentProfile"; 
import StudentHelp from "./pages/student/StudentHelp"; 
import ClassDetails from "./pages/student/ClassDetails"; 
import { ClassProvider } from './context/ClassContext';

function App() {
  return (
    <Routes>
      {/* Public Login */}
      <Route path="/" element={<Login />} />

      {/* ADMIN ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        {/* 🔴 FIX: Wrap AdminLayout with ClassProvider */}
        <Route path="/admin" element={
            <ClassProvider>
                <AdminLayout />
            </ClassProvider>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="teachers" element={<ManageUsers roleType="teacher" />} />
          <Route path="students" element={<ManageUsers roleType="student" />} />
          <Route path="classes" element={<ManageClasses />} />
          <Route path="reports" element={<AttendanceReports />} />
          <Route path="help" element={<AdminHelp />} />
        </Route>
      </Route>

      {/* TEACHER ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route path="/teacher" element={
            <ClassProvider> 
                <TeacherLayout />
            </ClassProvider>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="classes" element={<TeacherClasses />} />
          <Route path="live" element={<LiveSession />} />
          <Route path="permissions" element={<PermissionRequests />} />
          <Route path="/teacher/view-students" element={<TeacherStudentView />} />
          <Route path="history" element={<SessionHistory />} />
        </Route>
      </Route>

      {/* STUDENT ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student" element={
            <ClassProvider>
                <StudentLayout />
            </ClassProvider>
        }>
            {/* Redirect /student to /student/dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
            
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="class/:id" element={<ClassDetails />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="classmates" element={<Classmates />} />
            <Route path="requests" element={<Requests />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="help" element={<StudentHelp />} />
        </Route>
      </Route>

    </Routes>
  );
}

export default App;