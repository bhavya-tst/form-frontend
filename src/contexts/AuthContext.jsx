import React, { createContext, useContext, useState, useEffect } from "react";
import { setAuthDetails, deleteAuthDetails } from "../util/API/authStorage";
import { CONSTANTS } from "../util/constant/CONSTANTS";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const baseURL = import.meta.env.VITE_API_URL;
            const loginEndpoint = CONSTANTS.API.auth.login.endpoint;

            const response = await fetch(`${baseURL}${loginEndpoint}`, {
                method: CONSTANTS.API.auth.login.type,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Login failed");

            const token = data.token || data.data?.token;
            const userData = data.user || data.data?.user || data.data;

            if (!token) throw new Error("No authentication token received");

            setAuthDetails(token);
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);

            return { success: true };
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        deleteAuthDetails();
        localStorage.removeItem("user");
        setUser(null);
    };

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const value = { user, login, logout, getAuthHeaders, loading };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
