import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types/index.ts';
import { setApiRole, getApiRole, getApiUserName } from '../services/api.ts';

interface AuthContextType {
  role: UserRole;
  userName: string;
  setRole: (role: UserRole) => void;
  isAdmin: boolean;
  isOperator: boolean;
  isKiosk: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('ADMIN');
  const [userName, setUserName] = useState<string>('Administrator');

  const setRole = (newRole: UserRole) => {
    let name = 'Administrator';
    if (newRole === 'OPERATOR') name = 'Operator Input';
    if (newRole === 'KIOSK') name = 'Terminal Kios';

    setRoleState(newRole);
    setUserName(name);
    setApiRole(newRole, name);
  };

  useEffect(() => {
    setApiRole(role, userName);
  }, [role, userName]);

  return (
    <AuthContext.Provider
      value={{
        role,
        userName,
        setRole,
        isAdmin: role === 'ADMIN',
        isOperator: role === 'OPERATOR',
        isKiosk: role === 'KIOSK',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
