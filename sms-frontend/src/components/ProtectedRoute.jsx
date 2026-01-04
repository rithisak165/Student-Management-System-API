import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/" />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <div className="p-4 text-red-500">Access Denied: You are not authorized.</div>;
    }

    return <Outlet />; // Renders the child route (the dashboard)
};

export default ProtectedRoute;