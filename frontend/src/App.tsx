import React, { useState, useEffect } from "react";
import axios from "axios";
import RequestForm from "./components/RequestForm";
import RequestTable from "./components/RequestTable";
import RequestSearch from "./components/RequestSearch";
import Login from "./Login"; // 🌟 นำเข้าคอมโพเนนต์ Login

interface RequestItem {
  id: number;
  title: string;
  request_type: string;
  requester_name: string;
  requester_email: string;
  created_at: string;
  description: string;
  status: string;
}

const API_URL = "http://localhost:5000/api/requests";

export default function App() {
  // 🔐 1. AUTHENTICATION STATE (คุมบทบาทระบบ)
  const [role, setRole] = useState<"guest" | "user" | "admin">("guest"); // guest = ยังไม่เลือกสิทธิ์/ยังไม่ได้ล็อกอิน
  const [adminName, setAdminName] = useState("");

  // 📦 2. ORIGINAL STATE MANAGEMENT
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    title: "", request_type: "", requester_name: "", requester_email: "", description: "", status: "รอการดำเนินการ", created_at: "",
  });

  const [searchQuery, setSearchQuery] = useState({ title: "", requester_name: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  // 🔄 3. FUNCTIONS
  const fetchRequests = async (page: number) => {
    try {
      const response = await axios.get(`${API_URL}?page=${page}`);
      const resultData = response.data.data || response.data;
      setRequests(Array.isArray(resultData) ? resultData : []);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || 1);
    } catch (error) {
      console.error("ไม่สามารถดึงข้อมูลจาก Server ได้");
    }
  };

  const handleSearchRequests = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: { title: searchQuery.title, requester_name: searchQuery.requester_name },
      });
      const resultData = response.data.data || response.data;
      setRequests(Array.isArray(resultData) ? resultData : []);
      setTotalPages(1);
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการค้นหาข้อมูล");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery({ title: "", requester_name: "" });
    fetchRequests(1);
  };

  useEffect(() => {
    if (role !== "guest") {
      fetchRequests(currentPage);
    }
  }, [currentPage, role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery({ ...searchQuery, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.request_type || !formData.requester_name || !formData.requester_email || !formData.description) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนทุกช่อง");
      return;
    }

    try {
      if (editingId) {
        const updatedForm = {
          title: formData.title,
          request_type: formData.request_type,
          requester_name: formData.requester_name,
          requester_email: formData.requester_email,
          description: formData.description,
          status: formData.status || "รอการดำเนินการ",
        };
        await axios.put(`${API_URL}/${editingId}`, updatedForm);
        alert(`บันทึกการเปลี่ยนแปลงสำเร็จ`);
        setEditingId(null);
      } else {
        await axios.post(API_URL, { ...formData, status: "รอการดำเนินการ" });
        alert("ส่งคำขอ (Request) เรียบร้อยแล้ว");
      }
      setFormData({ title: "", request_type: "", requester_name: "", requester_email: "", description: "", status: "รอการดำเนินการ", created_at: "" });
      fetchRequests(currentPage);
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    }
  };

  const handleEditClick = async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      const targetData = response.data.data || response.data;
      setFormData({
        title: targetData.title || "",
        request_type: targetData.request_type || "",
        requester_name: targetData.requester_name || "",
        requester_email: targetData.requester_email || "",
        description: targetData.description || "",
        status: targetData.status || "รอการดำเนินการ",
        created_at: targetData.created_at || "",
      });
      setEditingId(id);
    } catch (error) {
      alert("ไม่สามารถดึงรายละเอียดไอเทมนี้ได้");
    }
  };

  const handleDeleteClick = async () => {
    if (!editingId) return;
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบ Request นี้ออกจากระบบแพลตฟอร์มกลาง?")) {
      try {
        await axios.delete(`${API_URL}/${editingId}`);
        alert("ลบรายการคำขอออกจากระบบเรียบร้อยแล้ว");
        handleCancelEdit();
        fetchRequests(currentPage);
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", request_type: "", requester_name: "", requester_email: "", description: "", status: "รอการดำเนินการ", created_at: "" });
  };

  const handleLogout = () => {
    setRole("guest");
    setAdminName("");
    handleCancelEdit();
  };

  // --------------------------------------------------------
  // 💻 RENDER WITH CONDITIONAL UI (แยกมุมมอง)
  // --------------------------------------------------------
  
  // 1. ดักสภาวะแรกเริ่ม: ถ้ายังไม่ล็อกอิน ให้แสดงคอมโพเนนต์หน้า Login ก่อนเลย
  if (role === "guest") {
    return (
      <Login 
        onLoginSuccess={(adminData) => {
          setRole("admin");
          setAdminName(adminData.username);
        }}
        onSkipToUser={() => setRole("user")}
      />
    );
  }

  // 2. แสดงผลหน้าจอการทำงานหลักเมื่อผ่านหน้าล็อกอินเข้ามาแล้ว
  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>POC - Request Management ({role === "admin" ? `👮‍♂️ โหมดแอดมิน: ${adminName}` : "🙋‍♂️ โหมดผู้ใช้ทั่วไป"})</h2>
        <button onClick={handleLogout} style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
          ออกจากระบบ / สลับหน้า
        </button>
      </div>
      <hr />

      {/* 🔍 ส่วนค้นหา Request (โชว์ทุกบทบาท) */}
      <RequestSearch
        searchQuery={searchQuery}
        onSearchChange={handleSearchInputChange}
        onSearchSubmit={handleSearchRequests}
        onClearSearch={handleClearSearch}
      />

      {/* 🧩 ส่วนฟอร์มข้อมูล: 
          - ถ้าเป็น User ปกติ หรือไม่ได้กดปุ่มแก้ไขแอดมิน: แสดงฟอร์มส่งคำขอปกติ
          - ถ้าเป็น แอดมินล็อกอินเข้ามา แต่ยังไม่ได้คลิกเลือกแถวตาราง: โชว์กล่องแนะนำให้แอดมินไปกดเลือกงานก่อน */}
      <div style={{ marginBottom: "24px" }}>
        {role === "admin" && !editingId ? (
          <div style={{ padding: "25px", background: "#e2e3e5", color: "#383d41", borderRadius: "8px", border: "1px solid #d6d8db", fontSize: "16px" }}>
            💡 <strong>คำแนะนำสำหรับแอดมิน:</strong> กรุณากดปุ่ม <strong>"🔍 ดูรายละเอียด / แก้ไข"</strong> ที่แถวตารางด้านล่าง เพื่อปรับปรุงระดับสถานะหรือใส่คำอธิบายประกอบเอกสารชิ้นนั้นๆ ครับ
          </div>
        ) : (
          <RequestForm
            formData={formData}
            editingId={editingId}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={handleCancelEdit}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {/* 🧩 ตารางแสดงผลลัพธ์ข้อมูล */}
      <h3 style={{ marginTop: "40px" }}>📊 รายการ Request ทั้งหมดในระบบ</h3>
      <RequestTable
        requests={requests}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={fetchRequests}
        onEditClick={handleEditClick}
        onSearchClick={handleSearchRequests}
      />
    </div>
  );
}