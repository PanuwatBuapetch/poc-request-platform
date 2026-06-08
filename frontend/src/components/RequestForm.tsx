import React from "react";

interface FormData {
  title: string;
  request_type: string;
  requester_name: string;
  requester_email: string;
  description: string;
}

interface FormProps {
  formData: FormData;
  editingId: number | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export default function RequestForm({
  formData,
  editingId,
  onInputChange,
  onSubmit,
  onCancel,
  onDelete,
}: FormProps) {
  return (
    <div style={{ background: "#f5f5f5", padding: "20px", borderRadius: "8px", marginBottom: "24px" }}>
      <h3>{editingId ? "📝 แก้ไขข้อมูล Request" : "➕ เพิ่มรายการ Request ใหม่"}</h3>
      <form onSubmit={onSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          
          {/* หัวข้อ Request */}
          <div>
            <label htmlFor="title">หัวข้อ Request *:</label>
            <input id="title" type="text" name="title" value={formData.title} onChange={onInputChange} style={{ width: "100%", padding: "6px" }} />
          </div>

          {/* ประเภท Request */}
          <div>
            <label htmlFor="request_type">ประเภท Request *:</label>
            <select id="request_type" name="request_type" value={formData.request_type} onChange={onInputChange} style={{ width: "100%", padding: "6px" }}>
              <option value="">-- เลือกประเภทบริการ --</option>
              <option value="บริการ Find Fulltext 4U">บริการ Find Fulltext 4U</option>
              <option value="บริการตรวจการคัดลอกผลงาน (iThenticate)">บริการตรวจการคัดลอกผลงาน (iThenticate)</option>
              <option value="บริการนำส่งหนังสือ (Book Delivery)">บริการนำส่งหนังสือ (Book Delivery)</option>
            </select>
          </div>

          {/* ชื่อผู้ส่ง Request */}
          <div>
            <label htmlFor="requester_name">ชื่อผู้ส่ง Request *:</label>
            <input id="requester_name" type="text" name="requester_name" value={formData.requester_name} onChange={onInputChange} style={{ width: "100%", padding: "6px" }} />
          </div>

          {/* อีเมลผู้ส่ง Request */}
          <div>
            <label htmlFor="requester_email">อีเมลผู้ส่ง Request *:</label>
            <input id="requester_email" type="email" name="requester_email" value={formData.requester_email} onChange={onInputChange} style={{ width: "100%", padding: "6px" }} />
          </div>
        </div>

        {/* รายละเอียด Request */}
        <div style={{ marginBottom: "12px" }}>
          <label htmlFor="description">รายละเอียด Request *:</label>
          <textarea id="description" name="description" value={formData.description} onChange={onInputChange} rows={3} style={{ width: "100%", padding: "6px" }} />
        </div>

        <button type="submit" style={{ background: editingId ? "#e67e22" : "#2ecc71", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "pointer", marginRight: "8px" }}>
          {editingId ? "บันทึกการเปลี่ยนแปลง" : "บันทึก"}
        </button>
        
        {editingId && (
          <>
            <button type="button" onClick={onCancel} style={{ background: "#7f8c8d", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "pointer", marginRight: "8px" }}>
              ยกเลิก
            </button>
            <button type="button" onClick={onDelete} style={{ background: "#e74c3c", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "pointer" }}>
              ลบ
            </button>
          </>
        )}
      </form>
    </div>
  );
}