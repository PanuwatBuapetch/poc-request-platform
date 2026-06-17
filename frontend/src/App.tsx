import React, { useState, useEffect } from "react";
import axios from "axios";
import RequestForm from "./components/RequestForm";
import RequestTable from "./components/RequestTable";
import RequestSearch from "./components/RequestSearch";

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
  // --------------------------------------------------------
  // 📦 STATE MANAGEMENT
  // --------------------------------------------------------
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // สเตตัสฟอร์มข้อมูลหลัก
  const [formData, setFormData] = useState({
    title: "",
    request_type: "",
    requester_name: "",
    requester_email: "",
    description: "",
    status: "รอการดำเนินการ",
    created_at: "",
  });

  // สเตตัสรับค่าค้นหาข้อมูล (Search)
  const [searchQuery, setSearchQuery] = useState({
    title: "",
    requester_name: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  // --------------------------------------------------------
  // 🔄 FUNCTIONS (เรียกอ่านข้อมูลและค้นหา)
  // --------------------------------------------------------
  
  // [READ] อ่านข้อมูลรายการพจนานุกรมปกติรายหน้า
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

  // 🔍 [SEARCH LOGIC] ยิงเชื่อมฐานข้อมูลแกะกล่องสเตตัสพ่นออกจอภาพจริง
  const handleSearchRequests = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // ป้องกันหน้าต่างเบราว์เซอร์รีเฟรชตัวเอง
    try {
      // ส่งพารามิเตอร์ไปหา Server ฝั่งหลังบ้านเส้น /search
      const response = await axios.get(`${API_URL}/search`, {
        params: {
          title: searchQuery.title,
          requester_name: searchQuery.requester_name,
        },
      });

      const resultData = response.data.data || response.data;
      // 🌟 ไฮไลท์: เอาข้อมูลผลลัพธ์ที่ค้นเจอจริงๆ พ่นลงสเตตัสหลัก เพื่อบังคับให้ตารางวาดตัวอักษรใหม่ทันที!
      setRequests(Array.isArray(resultData) ? resultData : []);
      setTotalPages(1); // บีบระบบนำทางตัวเลขหน้าให้เหลือหน้าเดียวชั่วคราวตอนค้นหา
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการค้นหาข้อมูล");
    }
  };

  // 🔄 ล้างตัวกรอง เพื่อเรียกข้อมูลพนักงาน/คำขอทั้งหมดกลับมาคืนตาราง
  const handleClearSearch = () => {
    setSearchQuery({ title: "", requester_name: "" });
    fetchRequests(1); // เรียกอ่านข้อมูลหน้าแรกใหม่ตั้งแต่ต้น
  };

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery({ ...searchQuery, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.request_type ||
      !formData.requester_name ||
      !formData.requester_email ||
      !formData.description
    ) {
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

  // --------------------------------------------------------
  // 💻 RENDER COMPONENT
  // --------------------------------------------------------
  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>POC - Request Management</h2>
      <hr />

      {/* 🔍 ฟอร์มสำหรับค้นหาข้อมูล */}
      <RequestSearch
        searchQuery={searchQuery}
        onSearchChange={handleSearchInputChange}
        onSearchSubmit={handleSearchRequests}
        onClearSearch={handleClearSearch}
      />

      {/* 🧩 ฟอร์มเพิ่ม/แก้ไขข้อมูล */}
      <RequestForm
        formData={formData}
        editingId={editingId}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={handleCancelEdit}
        onDelete={handleDeleteClick}
      />

      {/* 🧩 ตารางแสดงผลลัพธ์: แก้ไขผูกตัวแปร handleSearchRequests ให้ตารางรับทราบลอจิกเรียบร้อยแล้ว */}
      <h3 style={{ marginTop: "40px" }}>รายการคำขอในระบบ</h3>
      <RequestTable
        requests={requests}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={fetchRequests}
        onEditClick={handleEditClick}
        onSearchClick={handleSearchRequests} // ✨ อัปเดตจุดสำคัญตรงนี้!
      />
    </div>
  );
}