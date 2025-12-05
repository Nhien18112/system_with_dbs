// src/AuthContext.js
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // login can be called with either (username, role) or a single user object
  const login = (a, b) => {
    if (a && typeof a === 'object') {
      setUser(a);
    } else {
      setUser({ id: undefined, username: a, role: b });
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// hook dùng trong các component
export const useAuth = () => useContext(AuthContext);
