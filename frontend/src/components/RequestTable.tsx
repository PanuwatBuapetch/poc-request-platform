import React from "react";

interface RequestItem {
  id: number;
  title: string;
  request_type: string;
  requester_name: string;
  requester_email: string;
  created_at: string;
  status: string; 
  description: string; // มั่นใจว่า Interface รองรับฟิลด์ description
}

interface TableProps {
  requests: RequestItem[]; 
  currentPage: number;     
  totalPages: number;      
  role: string; 
  onPageChange: (page: number) => void; 
  onEditClick: (id: number) => void;    
  onSearchClick: (e: React.FormEvent) => void; 
}

export default function RequestTable({
  requests,
  currentPage,
  totalPages,
  role, 
  onPageChange,
  onEditClick,
  onSearchClick
}: TableProps) {
  
  // 🎨 ฟังก์ชันช่วยเลือกสีพื้นหลังของ Badge สถานะ
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "รอการดำเนินการ":
        return { backgroundColor: "#f1c40f", color: "#000", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" };
      case "อยู่ระหว่างดำเนินการ":
        return { backgroundColor: "#3498db", color: "#fff", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" };
      case "ดำเนินการแล้ว":
        return { backgroundColor: "#2ecc71", color: "#fff", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" };
      case "ปฎิเสธ":
        return { backgroundColor: "#e74c3c", color: "#fff", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" };
      default:
        return { backgroundColor: "#95a5a6", color: "#fff", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" };
    }
  };

  // 🕒 ฟังก์ชันดักจับป้องกันการแปลงวันที่พัง (Safe Date Formatter)
  const formatTableTime = (timeStr: string) => {
    if (!timeStr) return "ไม่ระบุเวลา";
    try {
      const dateObj = new Date(timeStr);
      if (isNaN(dateObj.getTime())) return timeStr; 
      return dateObj.toLocaleString("th-TH");
    } catch {
      return timeStr;
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <table border={1} cellPadding={8} style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", marginBottom: "16px", fontSize: "14px" }}>
        <thead style={{ background: "#34495e", color: "#fff" }}>
          <tr>
            <th>เลขที่ (ID)</th>
            <th>คำขอ Request</th>
            <th>ประเภทบริการ</th>
            <th>ชื่อผู้ส่งคำขอ</th>
            <th>อีเมลผู้ส่ง</th>
            <th>วันที่อัปเดตล่าสุด</th>
            <th>สถานะ</th>
            <th>จัดการข้อมูล</th>
          </tr>
        </thead>
        <tbody>
          {!requests || requests.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: "20px", color: "#7f8c8d" }}>
                ไม่พบข้อมูลรายการคำขอที่ค้นหาในระบบ
              </td>
            </tr>
          ) : (
            requests.map((item) => (  
              <tr key={item.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td>{item.id}</td>
                <td style={{ fontWeight: "bold" }}>{item.title}</td>
                <td>{item.request_type}</td>
                <td>{item.requester_name}</td>
                <td>
                  <a href={`mailto:${item.requester_email}`}>{item.requester_email}</a>
                </td>
                <td>{formatTableTime(item.created_at)}</td>
                <td>
                  <span style={getStatusStyle(item.status)}>
                    {item.status || "ไม่ระบุสถานะ"}
                  </span>
                </td>
                
                {/* 🔒 จัดสรรสิทธิ์ปุ่มเปิดดูรายละเอียดตามโจทย์ */}
                <td>
                  {role === "admin" ? (
                    // 👮‍♂️ สิทธิ์แอดมิน: กดเปิดขึ้นมาดูรายละเอียดคำอธิบายประกอบ และสลับแก้ไขสถานะได้แบบ Full Option
                    <button 
                      onClick={() => onEditClick(item.id)} 
                      style={{ background: "#e67e22", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                    >
                      📝 ตรวจสอบ & แก้ไขสถานะ
                    </button>
                  ) : (
                    // 🙋‍♂️ สิทธิ์ผู้ใช้งานทั่วไป: ล็อกระบบไม่ให้เข้าถึงการจัดการหลังบ้าน
                    <span style={{ color: "#7f8c8d", fontSize: "13px", fontStyle: "italic" }}>🔒 เฉพาะผู้ดูแลระบบ</span>
                  )}
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 🧭 บล็อกควบคุมระบบ Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
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
      )}
    </div>
  );
}