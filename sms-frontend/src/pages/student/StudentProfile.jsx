import { useAuth } from "../../context/AuthContext";

export default function StudentProfile() {
  const { user } = useAuth();
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-green-600"></div>
        <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-800 flex items-center justify-center text-4xl text-white font-bold">
                    {user?.name?.[0] || 'S'}
                </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">{user?.name}</h1>
            <p className="text-gray-500">Class {user?.class || "10-A"}</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase font-bold">Email</p>
                    <p className="text-gray-700">{user?.email || "student@example.com"}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase font-bold">Student ID</p>
                    <p className="text-gray-700">#20230001</p>
                </div>
            </div>
        </div>
    </div>
  );
}