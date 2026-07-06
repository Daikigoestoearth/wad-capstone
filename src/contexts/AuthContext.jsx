// File: src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { TokenStore } from "../lib/tokenStore";

// 1. Buat Context
const AuthContext = createContext(null);

// 2. Provider membungkus seluruh aplikasi
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // cek sesi saat pertama load

  // Cek apakah ada sesi aktif saat app pertama kali dibuka
  useEffect(() => {
    const restore = async () => {
      if (!TokenStore.isLoggedIn()) {
        setLoading(false);
        return;
      }
      
      try {
        // Coba refresh token untuk dapatkan access token baru
        const rfToken = TokenStore.getRefreshToken();
        const { data } = await axios.post("/auth/refresh", { refreshToken: rfToken });
        TokenStore.setAccessToken(data.data.accessToken);
        
        // Ambil data user
        const { data: me } = await axios.get("/auth/me", {
          headers: { Authorization: `Bearer ${data.data.accessToken}` },
        });
        
        setUser(me.data);
      } catch {
        TokenStore.clear();
      } finally {
        setLoading(false);
      }
    };
    
    restore();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await axios.post("/auth/login", { email, password });
    const { accessToken, refreshToken, user: userData } = data.data;
    
    TokenStore.setAccessToken(accessToken);
    TokenStore.setRefreshToken(refreshToken);
    setUser(userData);
  }, []);

  const register = useCallback(async (name, email, password) => {
    await axios.post("/auth/register", { name, email, password });
  }, []);

  const logout = useCallback(async () => {
    try {
      const rfToken = TokenStore.getRefreshToken();
      await axios.post("/auth/logout", { refreshToken: rfToken }, {
        headers: { Authorization: `Bearer ${TokenStore.getAccessToken()}` }
      });
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

// 3. Custom hook shortcut untuk konsumsi context
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus digunakan di dalam AuthProvider");
  return ctx;
}