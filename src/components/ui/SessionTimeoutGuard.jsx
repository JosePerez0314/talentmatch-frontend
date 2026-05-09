import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TimeoutWarningModal from '../modals/TimeoutWarningModal';

// Times
const TIMEOUT_MS = 10 * 60 * 1000; // 10 Min
const WARNING_MS = 9 * 60 * 1000;  // 9 Min

const SessionTimeoutGuard = () => {
    const [showWarning, setShowWarning] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Update the timestamp in the localStorage
    const updateActivity = useCallback(() => {
        localStorage.setItem('lastActivity', Date.now().toString());
        setShowWarning(false);
    }, []);

    useEffect(() => {
        updateActivity(); // initialize on mount

        // THE REVIEW TIMER (Runs every 1 second)
        const intervalId = setInterval(() => {
            const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0', 10);
            const elapsed = Date.now() - lastActivity;

            if (elapsed >= TIMEOUT_MS) {
                // Log out
                logout();
                navigate('/login', { state: { sessionExpired: true }, replace: true });
            } else if (elapsed >= WARNING_MS) {
                // Show warning
                setShowWarning(true);
            } else {
                // hide if activity was synchronized from another tab
                setShowWarning(false);
            }
        }, 1000);

        //ACTIVITY TRACKING (1-second Throttle to avoid saturating React)
        //It only records activity a maximum of once per second
        let throttleTimer;
        const handleActivity = () => {
            if (throttleTimer) return;
            throttleTimer = setTimeout(() => {
                updateActivity();
                throttleTimer = null;
            }, 1000); 
        };

        // user interactions are read
        const events = ['mousemove', 'keydown', 'click', 'scroll'];
        events.forEach(e => window.addEventListener(e, handleActivity));

        // SYNCHRONIZATION BETWEEN TABS (Native Broadcast)
        const handleStorageChange = (e) => {
            if (e.key === 'lastActivity') {
                setShowWarning(false); // This is another tab updates, we remove the modal in this one
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // Cleaning
        return () => {
            clearInterval(intervalId);
            events.forEach(e => window.removeEventListener(e, handleActivity));
            window.removeEventListener('storage', handleStorageChange);
            if (throttleTimer) clearTimeout(throttleTimer);
        };
    }, [updateActivity, logout, navigate]);

    // 9 minutes pass, else render the invasive modal
    if (showWarning) {
        return <TimeoutWarningModal onContinue={updateActivity} />;
    }

    return null; // Invisible component if  fine
};

export default SessionTimeoutGuard;