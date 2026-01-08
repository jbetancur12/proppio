import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { api } from '../api/client';

interface User {
    userId: string;
    tenantId?: string;
    role?: string;
    globalRole?: string;
    email?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decoded = jwtDecode<User>(storedToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                return decoded;
            } catch (e) {
                return null;
            }
        }
        return null;
    });

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode<User>(token);
                // Check expiry?
                setUser(decoded);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (e) {
                logout();
            }
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
