// File: src/contexts/SocketContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { TokenStore } from "../lib/tokenStore";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null); // gunakan ref agar tidak memicu rerender
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!user) {
      // Tidak ada user → putuskan koneksi jika ada
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // Buat koneksi baru saat user login
    // PERBAIKAN: Arahkan langsung ke port 3000 (backend), bukan window.location.origin
    const socket = io("http://localhost:3000", {
      // Kirim access token sebagai auth (bukan di query string)
      auth: { token: TokenStore.getAccessToken() },
      // Coba WebSocket dulu, fallback ke long-polling
      transports: ["websocket", "polling"],
      // Reconnection config
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] Terhubung:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Terputus:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Error koneksi:", err.message);
      setIsConnected(false);
    });

    socket.on("users:online", ({ count }) => {
      setOnlineCount(count);
    });

    // Cleanup saat user logout atau komponen unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]); // re-run saat user berubah (login/logout)


  // --- LOGIKA RECONNECT SOCKET SAAT TOKEN DIPERBARUI (Langkah 14) ---
  useEffect(() => {
    const handleTokenRefresh = (e) => {
      if (socketRef.current) {
        // Update auth token di socket yang sudah terhubung
        socketRef.current.auth = { token: e.detail.token };
        // Reconnect agar server memverifikasi token baru
        socketRef.current.disconnect().connect();
      }
    };

    window.addEventListener("token:refreshed", handleTokenRefresh);
    return () => window.removeEventListener("token:refreshed", handleTokenRefresh);
  }, []);
  // -------------------------------------------------------------------

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, onlineCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket harus digunakan di dalam SocketProvider");
  return ctx;
}