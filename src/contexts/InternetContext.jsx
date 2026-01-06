import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { notification } from "antd";

const InternetContext = createContext();

export const useInternet = () => useContext(InternetContext);

export const InternetProvider = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const handleOnline = useCallback(() => setIsOnline(true), []);
    const handleOffline = useCallback(() => setIsOnline(false), []);

    useEffect(() => {
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [handleOnline, handleOffline]);

    return (
        <InternetContext.Provider value={{ isOnline }}>
            {children}
        </InternetContext.Provider>
    );
};

export default InternetContext;
