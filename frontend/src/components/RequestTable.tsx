import React from "react";

interface RequestItem {
  id: number;
  title: string;
  request_type: string;
  requester_name: string;
  requester_email: string;
  created_at: string;
}

interface TableProps {
  requests: RequestItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEditClick: (id: number) => void;
}

export default function RequestTable({
  requests,
  currentPage,
  totalPages,
  onPageChange,
  onEditClick,
}: TableProps) {
  return (
    <>
      <h3>📊 รายการ Request ทั้งหมดในระบบ</h3>
      <table border={1} cellPadding={8} style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", marginBottom: "16px" }}>
        <thead style={{ background: "#34495e", color: "#fff" }}>
          <tr>
            <th>1. เลขที่ (ID)</th>
            <th>2. หัวข้อ</th>
            <th>3. ประเภท</th>
            <th>4. ชื่อผู้ส่งคำขอ</th>
            <th>5. อีเมลผู้ส่งคำขอ</th>
            <th>6. วันที่สร้าง</th>
            <th>จัดการข้อมูล</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>ไม่พบข้อมูลรายการคำขอในระบบ</td>
            </tr>
          ) : (
            requests.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.title}</td>
                <td>{item.request_type}</td>
                <td>{item.requester_name}</td>
                <td>{item.requester_email}</td>
                <td>{new Date(item.created_at).toLocaleString("th-TH")}</td>
                <td>
                  <button 
                    onClick={() => onEditClick(item.id)} 
                    style={{ background: "#3498db", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}
                  >
                    ดูรายละเอียด / แก้ไข
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* บล็อกควบคุมระบบ Pagination */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
        <button 
          disabled={currentPage === 1} 
          onClick={() => onPageChange(currentPage - 1)} 
          style={{ padding: "6px 12px", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
        >
          ก่อนหน้า
        </button>
        <span style={{ alignSelf: "center" }}>หน้า {currentPage} จาก {totalPages}</span>
        <button 
          disabled={currentPage === totalPages} 
          onClick={() => onPageChange(currentPage + 1)} 
          style={{ padding: "6px 12px", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
        >
          ถัดไป
        </button>
      </div>
    </>
  );
}