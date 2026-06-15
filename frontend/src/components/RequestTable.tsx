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
  requests: RequestItem[]; // อาเรย์ข้อมูลที่จะนำมาลูปแสดงผลในตาราง
  currentPage: number;     // หน้าปัจจุบัน
  totalPages: number;      // จำนวนหน้าทั้งหมด
  onPageChange: (page: number) => void; // ฟังก์ชันสั่งเปลี่ยนหน้าเมื่อกดปุ่ม
  onEditClick: (id: number) => void;    // ฟังก์ชันสั่งเลือกแถวมาแก้ไขข้อมูล
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
            <th>เลขที่ (ID)</th>
            <th>หัวข้อ</th>
            <th>ประเภท</th>
            <th>ชื่อผู้ส่งคำขอ</th>
            <th>อีเมลผู้ส่งคำขอ</th>
            <th>วันที่สร้าง</th>
            <th>จัดการข้อมูล</th>
          </tr>
        </thead>
        <tbody>
          {/* 💡 ลอจิกตรวจสอบข้อมูลว่างเปล่า (Ternary Operator): 
              ถ้าอาเรย์ `requests` มีความยาวเป็น 0 ให้แสดงข้อความว่า ไม่พบข้อมูล 
              แต่ถ้ามีข้อมูล ให้เข้าลูป .map() เพื่อกางข้อมูลออกมาเป็นแถวตาราง */}
          {requests.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>ไม่พบข้อมูลรายการคำขอในระบบ</td>
            </tr>
          ) : (
            requests.map((item) => (
              <tr key={item.id}>
                {/* พ่นค่า ID, หัวข้อ, ประเภท, ชื่อ และอีเมล ลงในแต่ละ Cell */}
                <td>{item.id}</td>
                <td>{item.title}</td>
                <td>{item.request_type}</td>
                <td>{item.requester_name}</td>
                <td>{item.requester_email}</td>
                {/* แปลงรูปแบบวันที่ (Timestamp) จากหลังบ้านให้เป็นภาษาไทยและรูปแบบท้องถิ่น */}
                <td>{new Date(item.created_at).toLocaleString("th-TH")}</td>
                <td>
                  {/* ปุ่มดึงข้อมูลย้อนกลับไปยังฟังก์ชัน handleEditClick ของไฟล์แม่ โดยส่งไอดี (item.id) ติดไปด้วย */}
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

      {/* 🧭 บล็อกควบคุมระบบ Pagination */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
        {/* ปุ่มย้อนกลับ: จะกดไม่ได้ (disabled) หากหน้าปัจจุบันอยู่ที่หน้า 1 */}
        <button 
          disabled={currentPage === 1} 
          onClick={() => onPageChange(currentPage - 1)} 
          style={{ padding: "6px 12px", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
        >
          ก่อนหน้า
        </button>
        
        <span style={{ alignSelf: "center" }}>หน้า {currentPage} จาก {totalPages}</span>
        
        {/* ปุ่มถัดไป: จะกดไม่ได้ (disabled) หากหน้าปัจจุบันเท่ากับจำนวนหน้าทั้งหมด (totalPages) */}
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