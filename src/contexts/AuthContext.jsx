// File: src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../lib/axios"; 
import { TokenStore } from "../lib/tokenStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      if (!TokenStore.isLoggedIn()) {
        setLoading(false);
        return;
      }
      
      try {
        const rfToken = TokenStore.getRefreshToken();
        const response = await api.post("/auth/refresh", { refreshToken: rfToken });
        
        // Menyesuaikan jaga-jaga jika refresh token formatnya sama seperti login
        const newAccessToken = response.data.accessToken || response.data.data.accessToken;
        TokenStore.setAccessToken(newAccessToken);
        
        const { data: me } = await api.get("/auth/me");
        setUser(me.data || me);
      } catch {
        TokenStore.clear();
      } finally {
        setLoading(false);
      }
    };
    
    restore();
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    
    // Perbaikan: Ekstrak token dan data user sesuai format JSON backend Anda
    const accessToken = response.data.accessToken;
    const refreshToken = response.data.refreshToken;
    const userData = response.data.data; // Info user ada di dalam properti 'data'
    
    TokenStore.setAccessToken(accessToken);
    TokenStore.setRefreshToken(refreshToken);
    setUser(userData);
  }, []);

  const register = useCallback(async (name, email, password) => {
    await api.post("/auth/register", { name, email, password });
  }, []);

  const logout = useCallback(async () => {
    try {
      const rfToken = TokenStore.getRefreshToken();
      await api.post("/auth/logout", { refreshToken: rfToken });
    } catch { 
      /* abaikan error logout */ 
    }
    TokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus digunakan di dalam AuthProvider");
  return ctx;
}