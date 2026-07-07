// File: src/hooks/useRealTimeTasks.js
import { useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useNotif } from "../contexts/NotifContext";

/**
 * Hook ini mendaftarkan listener Socket.IO untuk event task.
 * setTasks -> setter untuk update state dari komponen utama
 */
export function useRealTimeTasks(setTasks) {
  const { socket } = useSocket();
  const { addToast } = useNotif();

  useEffect(() => {
    if (!socket) return;

    // -- Mendengarkan saat ada task baru --
    const onTaskCreated = ({ task }) => {
      setTasks(prev => {
        // Hindari duplikat jika task ini dibuat oleh user sendiri
        const exists = prev.some(t => t.id === task.id);
        if (exists) return prev;
        return [task, ...prev];
      });
    };

    // -- Mendengarkan saat task diubah --
    const onTaskUpdated = ({ task }) => {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
      addToast({
        type: "INFO",
        title: "Task Diperbarui",
        message: `Task "${task.title}" telah diperbarui oleh pengguna lain.`,
      });
    };

    // -- Mendengarkan saat task dihapus --
    const onTaskDeleted = ({ taskId }) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    };

    // -- Mendengarkan notifikasi personal --
    const onNotification = (notif) => {
      addToast(notif);
    };

    // Daftarkan semua listener ke socket
    socket.on("task:created", onTaskCreated);
    socket.on("task:updated", onTaskUpdated);
    socket.on("task:deleted", onTaskDeleted);
    socket.on("notification", onNotification);

    // Cleanup: hapus listener saat komponen ditutup (unmount)
    return () => {
      socket.off("task:created", onTaskCreated);
      socket.off("task:updated", onTaskUpdated);
      socket.off("task:deleted", onTaskDeleted);
      socket.off("notification", onNotification);
    };
  }, [socket, setTasks, addToast]);
}