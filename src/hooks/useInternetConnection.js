import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInternet } from '../contexts/InternetContext';

const useInternetConnection = () => {
    const { isOnline } = useInternet();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isOnline && location.pathname !== '/no-internet') {
            navigate('/no-internet');
        } else if (isOnline && location.pathname === '/no-internet') {
            navigate(-1); // Go back
        }
    }, [isOnline, navigate, location]);

    return { isOnline };
};

export default useInternetConnection;
