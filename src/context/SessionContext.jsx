import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearStoredSession, getStoredSession, setStoredSession } from '../utils/session';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [session, setSessionState] = useState(() => getStoredSession());

  useEffect(() => {
    const handleStorage = () => setSessionState(getStoredSession());

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setSession = (response) => {
    const nextSession = setStoredSession(response);
    setSessionState(nextSession);
    return nextSession;
  };

  const clearSession = () => {
    clearStoredSession();
    setSessionState({ token: null, user: null });
  };

  const value = useMemo(
    () => ({
      token: session.token,
      user: session.user,
      isAuthenticated: Boolean(session.token),
      setSession,
      clearSession,
    }),
    [session.token, session.user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}