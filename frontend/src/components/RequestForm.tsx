import React from "react";

interface FormData {
  title: string;
  request_type: string;
  requester_name: string;
  requester_email: string;
  description: string;
  status: string;
  created_at: string;
}

interface FormProps {
  formData: FormData;
  editingId: number | null;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
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
  
  // ฟังก์ชันช่วยจัดรูปแบบการแสดงผลวันเวลาให้ดูง่ายสไตล์ไทย
  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return "ไม่มีข้อมูลประวัติเวลา";
    try {
      const dateObj = new Date(timeStr);
      return dateObj.toLocaleString("th-TH");
    } catch {
      return timeStr;
    }
  };

  return (
    <div
      style={{
        background: "#f5f5f5",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "24px",
      }}
    >
      <h3>
        {editingId ? "📝 แก้ไขข้อมูล Request (โหมดผู้ดูแลระบบ)" : "➕ เพิ่มรายการ Request ใหม่ (โหมดผู้ใช้งานทั่วไป)"}
      </h3>

      <form onSubmit={onSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          {/* ช่องกรอกหัวข้อ Request */}
          <div>
            <label htmlFor="title">คำขอ Request *:</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={onInputChange}
              style={{ width: "100%", padding: "6px", boxSizing: "border-box" }}
            />
          </div>

          {/* ช่องเลือกประเภทบริการ */}
          <div>
            <label htmlFor="request_type">ประเภท Request *:</label>
            <select
              id="request_type"
              name="request_type"
              value={formData.request_type}
              onChange={onInputChange}
              style={{ width: "100%", padding: "6px", boxSizing: "border-box" }}
            >
              <option value="">-- เลือกประเภทบริการ --</option>
              <option value="บริการ Find Fulltext 4U">บริการ Find Fulltext 4U</option>
              <option value="บริการตรวจการคัดลอกผลงาน (iThenticate)">บริการตรวจการคัดลอกผลงาน (iThenticate)</option>
              <option value="บริการนำส่งหนังสือ (Book Delivery)">บริการนำส่งหนังสือ (Book Delivery)</option>
              <option value="บริการยืมระหว่างห้องสมุด (Interlibrary Loan)">บริการยืมระหว่างห้องสมุด (Interlibrary Loan)</option>
              <option value="บริการนำส่งเผยแพร่ผลงาน หนังสือ ตำรา">บริการนำส่งเผยแพร่ผลงาน หนังสือ ตำรา</option>
            </select>
          </div>

          {/* ช่องเลือกสถานะตามเงื่อนไขโจทย์ข้อสอง */}
          <div>
            <label htmlFor="status">สถานะ Request *:</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={onInputChange}
              style={{ width: "100%", padding: "6px", boxSizing: "border-box" }}
            >
              <option value="">-- เลือกสถานะ --</option>
              <option value="รอการดำเนินการ">รอการดำเนินการ</option>
              <option value="อยู่ระหว่างดำเนินการ">อยู่ระหว่างดำเนินการ</option>
              <option value="ดำเนินการแล้ว">ดำเนินการแล้ว</option>
              <option value="ปฎิเสธ">ปฎิเสธ</option>
            </select>
          </div>

          {/* ช่องกรอกชื่อผู้ส่ง */}
          <div>
            <label htmlFor="requester_name">ชื่อผู้ส่ง Request *:</label>
            <input
              id="requester_name"
              type="text"
              name="requester_name"
              value={formData.requester_name}
              onChange={onInputChange}
              style={{ width: "100%", padding: "6px", boxSizing: "border-box" }}
            />
          </div>

          {/* ช่องกรอกอีเมล */}
          <div>
            <label htmlFor="requester_email">อีเมลผู้ส่ง Request *:</label>
            <input
              id="requester_email"
              type="email"
              name="requester_email"
              value={formData.requester_email}
              onChange={onInputChange}
              style={{ width: "100%", padding: "6px", boxSizing: "border-box" }}
            />
          </div>
        </div>

        {/* ช่องกรอกรายละเอียด/คำอธิบาย (Description) */}
        <div style={{ marginBottom: "12px" }}>
          <label htmlFor="description">รายละเอียด/คำอธิบายข้อมูลประกอบ *:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={onInputChange}
            rows={3}
            style={{ width: "100%", padding: "6px", boxSizing: "border-box" }}
          />
        </div>

        {/* 🕒 ช่องแสดงบันทึกเวลาอัปเดตล่าสุดสไตล์ประวัติเอกสารตามโจทย์ */}
        {editingId && (
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="created_at">บันทึกเวลาอัปเดตล่าสุดจากระบบ:</label>
            <input
              id="created_at"
              type="text"
              name="created_at"
              value={formatDisplayTime(formData.created_at)}
              disabled
              style={{
                width: "100%",
                padding: "6px",
                backgroundColor: "#e9ecef",
                color: "#495057",
                boxSizing: "border-box",
                fontWeight: "bold",
              }}
            />
          </div>
        )}

        <button
          type="submit"
          style={{
            background: editingId ? "#e67e22" : "#2ecc71",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "8px",
          }}
        >
          {editingId ? "บันทึกการเปลี่ยนแปลงสถานะ" : "ส่งคำขอหลัก"}
        </button>

        {editingId && (
          <>
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: "#7f8c8d",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "8px",
              }}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={onDelete}
              style={{
                background: "#e74c3c",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ลบคำขอนี้
            </button>
          </>
        )}
      </form>
    </div>
  );
}