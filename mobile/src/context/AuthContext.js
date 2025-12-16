import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Start with no user (shows login screen)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Continue as guest - sets user to guest
  const continueAsGuest = () => {
    setUser({ id: 'guest', name: 'Guest', email: 'guest@wellvantage.com' });
  };

  // Sign out - sets user to null to show login screen
  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, continueAsGuest, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

