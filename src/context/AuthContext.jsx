import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'apk_cargiotran_session';

// Demo credentials — swap validateCredentials() for a real API call when a
// backend is available. Anything beyond this function is already wired for it.
function validateCredentials(operatorId, password) {
  return operatorId.trim().length >= 3 && password.trim().length >= 4;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setReady(true);
  }, []);

  function login(operatorId, password) {
    if (!validateCredentials(operatorId, password)) {
      return { ok: false, error: 'Matrícula ou senha inválida. Verifique e tente novamente.' };
    }
    const session = {
      operatorId: operatorId.trim(),
      loggedInAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
  }

  function logout() {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
