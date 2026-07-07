// File: src/components/TaskForm.jsx
import { useForm } from "react-hook-form";
import { useEffect } from "react";

export function TaskForm({ onSubmit, onCancel, initialData = null }) {
  const isEdit = !!initialData;
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      status: "todo", 
      priority: "medium",
      dueDate: "",
    },
  });
  
  // PERBAIKAN 1: Bersihkan dan sesuaikan data dari backend sebelum masuk ke form
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || "",
        description: initialData.description || "",
        // Paksa menjadi huruf kecil agar cocok dengan opsi dropdown kita
        status: initialData.status ? initialData.status.toLowerCase() : "todo",
        priority: initialData.priority ? initialData.priority.toLowerCase() : "medium",
        // Jika ada tanggal dari database (contoh: 2024-05-12T00:00:00.000Z), potong bagian waktunya
        dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : "",
      });
    }
  }, [initialData, reset]);
  
  // PERBAIKAN 2: Saring data sebelum dikirim agar Joi Backend tidak menolak
  const handlePreSubmit = (data) => {
    // KITA HANYA MENGIRIM FIELD YANG DIIZINKAN OLEH JOI
    // Jangan pernah mengirim 'id', 'createdAt', 'updatedAt', dll.
    const payload = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
    };

    // Kirim dueDate hanya jika benar-benar ada isinya
    if (data.dueDate) {
      payload.dueDate = data.dueDate;
    }

    onSubmit(payload);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>{isEdit ? "Edit Task" : "Buat Task Baru"}</h2>
        <form onSubmit={handleSubmit(handlePreSubmit)}>
          <div className="form-group">
            <label>Judul *</label>
            <input 
              {...register("title", { required: "Judul wajib diisi" })} 
            />
            {errors.title && <span className="error">{errors.title.message}</span>}
          </div>
          
          <div className="form-group">
            <label>Deskripsi</label>
            <textarea rows={3} {...register("description")} />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select {...register("status")}>
                <option value="todo">Belum Dimulai</option>
                <option value="in_progress">Sedang Dikerjakan</option>
                <option value="done">Selesai</option>
              </select>
            </div>
            <div className="form-group">
              <label>Prioritas</label>
              <select {...register("priority")}>
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Tenggat Waktu</label>
            <input type="date" {...register("dueDate")} />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}