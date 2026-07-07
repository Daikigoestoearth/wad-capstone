// File: src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext"; // -- TAMBAH INI

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Mengambil status koneksi dari SocketContext
  const { isConnected, onlineCount } = useSocket(); // -- TAMBAH INI

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/tasks">WAD Task Manager</Link>
      </div>
      
      <div className="navbar-menu">
        {/* -- TAMBAH INI: Indikator real-time -- */}
        <div className="rt-indicator">
          <span
            className="rt-dot"
            style={{ background: isConnected ? "#4ade80" : "#ef4444" }}
            title={isConnected ? "Real-time aktif" : "Tidak terhubung"}
          />
          <span className="rt-label">
            {isConnected ? `${onlineCount} online` : "Offline"}
          </span>
        </div>
        {/* ------------------------------------ */}

        <Link to="/tasks">Tasks</Link>
        <Link to="/profile">Profil</Link>
        <span className="navbar-user">Halo, {user?.name}</span>
        <button onClick={handleLogout} className="btn-logout">Keluar</button>
      </div>
    </nav>
  );
}