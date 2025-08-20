/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        user: null,
        token: null
    });
    const [loading, setLoading] = useState(true);

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedAuth = localStorage.getItem('adminAuth');
        if (storedAuth) {
            try {
                const { user, token } = JSON.parse(storedAuth);
                setAuthState({
                    isAuthenticated: true,
                    user,
                    token
                });
            } catch (error) {
                console.error("Failed to parse auth data", error);
                localStorage.removeItem('adminAuth');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        const authData = {
            isAuthenticated: true,
            user: userData,
            token
        };
        setAuthState(authData);
        localStorage.setItem('adminAuth', JSON.stringify({
            user: userData,
            token
        }));
    };

    const logout = () => {
        setAuthState({
            isAuthenticated: false,
            user: null,
            token: null
        });
        localStorage.removeItem('adminAuth');
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated: authState.isAuthenticated,
            user: authState.user,
            token: authState.token,
            login,
            logout,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);