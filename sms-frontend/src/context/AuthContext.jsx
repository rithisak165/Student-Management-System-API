import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext({
    user: null,
    selectedClass: null,
    updateSelectedClass: () => {},
    login: async () => {},
    logout: () => {},
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Helper to update selected class and save to local storage
    const updateSelectedClass = (classData) => {
        setSelectedClass(classData);
        localStorage.setItem('selectedClass', JSON.stringify(classData));
    };

    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem('token');
            const storedClass = localStorage.getItem('selectedClass');
            
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await api.get('/user');
                setUser(data);

                // Restore previously selected class or default to the first one
                if (storedClass) {
                    setSelectedClass(JSON.parse(storedClass));
                } else if (data.enrolled_classes?.length > 0) {
                    updateSelectedClass(data.enrolled_classes[0]);
                }
            } catch (error) {
                console.error("Session expired or invalid token");
                localStorage.removeItem('token');
                localStorage.removeItem('selectedClass');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    const getCsrfToken = async () => {
        await axios.get('http://localhost:8000/sanctum/csrf-cookie', { 
            withCredentials: true 
        });
    };

    const login = async (email, password) => {
        await getCsrfToken(); 
        try {
            const { data } = await api.post('/login', { email, password });

            localStorage.setItem('token', data.access_token);
            setUser(data.user);

            // Set default class on login
            if (data.user.enrolled_classes?.length > 0) {
                updateSelectedClass(data.user.enrolled_classes[0]);
            }

            if (data.user.role === 'admin') navigate('/admin');
            else if (data.user.role === 'teacher') navigate('/teacher');
            else if (data.user.role === 'student') navigate('/student');
            
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error("Logout failed", error);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('selectedClass');
        setUser(null);
        setSelectedClass(null);
        navigate('/');
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-xl font-semibold text-gray-500 animate-pulse">
                    Restoring Session...
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, selectedClass, updateSelectedClass, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);