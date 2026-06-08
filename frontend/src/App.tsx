import React, { useState, useEffect } from "react";
import axios from "axios";
import RequestForm from "./components/RequestForm";
import RequestTable from "./components/RequestTable";

interface RequestItem {
  id: number;
  title: string;
  request_type: string;
  requester_name: string;
  requester_email: string;
  created_at: string;
}

const API_URL = "http://localhost:5000/api/requests";

export default function App() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    request_type: "",
    requester_name: "",
    requester_email: "",
    description: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchRequests = async (page: number) => {
    try {
      const response = await axios.get(`${API_URL}?page=${page}`);
      setRequests(response.data.data);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || 1);
    } catch (error) {
      alert("ไม่สามารถดึงข้อมูลจาก Server ได้ กรุณาเช็คการรัน Backend");
    }
  };

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.requester_email)) {
      alert("กรุณากรอกอีเมลให้อยู่ในรูปแบบที่ถูกต้อง (เช่น name@email.com)");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        alert("บันทึกการเปลี่ยนแปลงสำเร็จ");
        setEditingId(null);
      } else {
        await axios.post(API_URL, formData);
        alert("บันทึกคำขอเสร็จสิ้น");
      }

      setFormData({ title: "", request_type: "", requester_name: "", requester_email: "", description: "" });
      fetchRequests(currentPage);
    } catch (error: any) {
      alert(error.response?.data?.error || "เกิดข้อผิดพลาดในการส่งข้อมูล");
    }
  };

  const handleEditClick = async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      setFormData({
        title: response.data.title,
        request_type: response.data.request_type,
        requester_name: response.data.requester_name,
        requester_email: response.data.requester_email,
        description: response.data.description || "",
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
    setFormData({ title: "", request_type: "", requester_name: "", requester_email: "", description: "" });
  };

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>POC - Request Management</h2>
      <hr />

      {/* เรียกใช้งานส่วนประกอบฟอร์ม */}
      <RequestForm 
        formData={formData}
        editingId={editingId}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={handleCancelEdit}
        onDelete={handleDeleteClick}
      />

      {/* เรียกใช้งานส่วนประกอบตารางข้อมูล */}
      <RequestTable 
        requests={requests}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={fetchRequests}
        onEditClick={handleEditClick}
      />
    </div>
  );
}