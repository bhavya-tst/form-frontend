import React, { createContext, useContext, useState, useCallback } from "react";
import { notification } from "antd";

const ErrorContext = createContext();

export const useError = () => {
    const context = useContext(ErrorContext);
    if (!context) throw new Error("useError must be used within an ErrorProvider");
    return context;
};

export const ErrorProvider = ({ children }) => {
    const [errors, setErrors] = useState([]);
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

    // Add error to the error list
    const addError = useCallback((error) => {
        const errorWithId = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            ...error,
        };
        setErrors((prev) => [...prev, errorWithId]);

        if (error.showNotification !== false) {
            // Simple notification logic based on type
            notification.error({
                message: error.type === 'network' ? 'Network Error' : 'Error',
                description: error.message || "An unexpected error occurred",
                duration: 4,
            });
        }
        return errorWithId.id;
    }, []);

    const handleHttpError = useCallback((error, response) => {
        const errorData = {
            type: "http",
            status: response?.status,
            message: error.message || "HTTP request failed",
            timestamp: new Date().toISOString(),
            showNotification: true
        };

        // If validation error (400), maybe don't show global notification if handled locally?
        // But standard rule says simple notification.
        return addError(errorData);
    }, [addError]);

    const handleNetworkError = useCallback((error) => {
        return addError({
            type: "network",
            message: "Network connection failed.",
            originalError: error,
        });
    }, [addError]);

    const value = {
        errors,
        isMaintenanceMode,
        addError,
        handleHttpError,
        handleNetworkError,
    };

    return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
};

export default ErrorContext;
