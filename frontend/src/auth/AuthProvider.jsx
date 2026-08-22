import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, onSessionLost, refreshSession, setAccessToken } from '../lib/api.js';
import { AuthContext } from './AuthContext.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');
  const [sessionEndedReason, setSessionEndedReason] = useState(null);
  const queryClient = useQueryClient();
  const bootstrapped = useRef(false);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus('anonymous');
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    onSessionLost((code) => {
      clearSession();
      setSessionEndedReason(code ?? null);
    });
  }, [clearSession]);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    refreshSession()
      .then((restored) => {
        setUser(restored);
        setStatus('authenticated');
      })
      .catch((error) => {
        setAccessToken(null);
        setStatus('anonymous');
        setSessionEndedReason(error?.response?.data?.error?.code ?? null);
      });
  }, []);

  const adopt = useCallback((payload) => {
    setAccessToken(payload.accessToken);
    setUser(payload.user);
    setStatus('authenticated');
    setSessionEndedReason(null);
    return payload.user;
  }, []);

  const clearSessionEnded = useCallback(() => setSessionEndedReason(null), []);

  const login = useCallback(
    async (credentials) => {
      const response = await api.post('/auth/login', credentials);
      return adopt(response.data.data);
    },
    [adopt],
  );

  const signup = useCallback(
    async (payload) => {
      const response = await api.post('/auth/register', payload);
      return adopt(response.data.data);
    },
    [adopt],
  );

  const completeOAuth = useCallback(async () => {
    const restored = await refreshSession();
    setUser(restored);
    setStatus('authenticated');
    return restored;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      sessionEndedReason,
      isDeactivated: sessionEndedReason === 'ACCOUNT_DISABLED',
      clearSessionEnded,
      login,
      signup,
      logout,
      completeOAuth,
    }),
    [user, status, sessionEndedReason, clearSessionEnded, login, signup, logout, completeOAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
