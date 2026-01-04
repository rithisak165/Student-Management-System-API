import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ClassContext = createContext();

export const ClassProvider = ({ children }) => {
    // Try to load from localStorage on boot
    const [currentClass, setCurrentClass] = useState(() => {
        const saved = localStorage.getItem('currentClass');
        return saved ? JSON.parse(saved) : null;
    });

    const navigate = useNavigate();

    // Function to enter a class
    const enterClass = (classData) => {
        setCurrentClass(classData);
        localStorage.setItem('currentClass', JSON.stringify(classData));
        // Redirect to the class details page immediately
        navigate(`/student/class/${classData.id}`);
    };

    // Function to exit/change class
    const exitClass = () => {
        setCurrentClass(null);
        localStorage.removeItem('currentClass');
        navigate('/student/dashboard');
    };

    return (
        <ClassContext.Provider value={{ currentClass, enterClass, exitClass }}>
            {children}
        </ClassContext.Provider>
    );
};

export const useClass = () => useContext(ClassContext);