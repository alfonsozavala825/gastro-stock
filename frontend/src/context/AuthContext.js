import React, { createContext, useContext, useState, useEffect } from 'react';
import useAuthHook from '../hooks/useAuth'; // Renamed to avoid conflict

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('usuario')));
  const { logout: authLogout } = useAuthHook(); // Use the logout function from the hook

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Update user in localStorage when user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('usuario', JSON.stringify(user));
    } else {
      localStorage.removeItem('usuario');
    }
  }, [user]);


  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    authLogout(); // Call the logout logic from the hook
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, setToken, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
