// File: src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { NotifProvider } from "./contexts/NotifContext"; // TAMBAH INI
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ToastContainer } from "./components/ToastContainer"; // TAMBAH INI

import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TasksPage } from "./pages/TasksPage";
import { ProfilePage } from "./pages/ProfilePage";

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotifProvider> {/* TAMBAH INI */}
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Navigate to="/tasks" replace />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/tasks" replace />} />
            </Routes>
            
            {/* Toast selalu tampil di semua halaman */}
            <ToastContainer /> {/* TAMBAH INI */}
          </BrowserRouter>
        </NotifProvider> {/* TUTUP NotifProvider */}
      </SocketProvider>
    </AuthProvider>
  );
}