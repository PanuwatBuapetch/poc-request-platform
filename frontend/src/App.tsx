import React, { useState, useEffect } from "react";
import axios from "axios";
import RequestForm from "./components/RequestForm";
import RequestTable from "./components/RequestTable";

// 📌 กำหนดโครงสร้างข้อมูล (Interface) ของวัตถุ Request สำหรับ TypeScript
interface RequestItem {
  id: number;
  title: string;
  request_type: string;
  requester_name: string;
  requester_email: string;
  created_at: string;
}

// 📌 URL สำหรับดึงข้อมูลและจัดการข้อมูลผ่าน RESTful APIs หลังบ้าน
const API_URL = "http://localhost:5000/api/requests";

export default function App() {
  // --------------------------------------------------------
  // 📦 STATE MANAGEMENT (การจัดการสถานะภายในแอป)
  // --------------------------------------------------------
  
  // เก็บอาเรย์รายการข้อมูลคำขอทั้งหมดที่ดึงมาจากฐานข้อมูล
  const [requests, setRequests] = useState<RequestItem[]>([]);
  
  // คุมหน้าปัจจุบันที่กำลังแสดงผล (Default เริ่มที่หน้า 1)
  const [currentPage, setCurrentPage] = useState(1);
  
  // จำนวนหน้าทั้งหมดที่คำนวณและส่งกลับมาจาก Backend เพื่อทำระบบเปลี่ยนหน้า
  const [totalPages, setTotalPages] = useState(1);

  // เก็บโครงสร้างข้อมูลที่ผู้ใช้งานพิมพ์ลงฟอร์ม (รองรับทั้งเพิ่มและแก้ไข)
  const [formData, setFormData] = useState({
    title: "",
    request_type: "",
    requester_name: "",
    requester_email: "",
    description: "",
  });

  // ใช้เช็กสถานะการทำงาน: ถ้าเป็น null แปลว่ากำลัง "เพิ่มข้อมูลใหม่" 
  // แต่ถ้าเก็บเลข ID แปลว่ากำลังอยู่ในโหมด "แก้ไขข้อมูล" ของ ID นั้น ๆ
  const [editingId, setEditingId] = useState<number | null>(null);

  // --------------------------------------------------------
  // 🔄 FUNCTIONS (ฟังก์ชันติดต่อ API และ Logic ในการทำงาน)
  // --------------------------------------------------------

  // [READ] ฟังก์ชันดึงข้อมูลจากหลังบ้านแบบระบุเลขหน้า (Pagination)
  const fetchRequests = async (page: number) => {
    try {
      // ส่ง query parameter เช่น ?page=1 ไปที่หลังบ้าน
      const response = await axios.get(`${API_URL}?page=${page}`);
      
      // อัปเดตข้อมูลลงสถานะเพื่อนำไปแสดงผลบนตาราง
      setRequests(response.data.data);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || 1);
    } catch (error) {
      alert("ไม่สามารถดึงข้อมูลจาก Server ได้ กรุณาเช็คการรัน Backend");
    }
  };

  // ดักจับการทำงาน: เมื่อหน้าปัจจุบัน (currentPage) เปลี่ยนแปลง ระบบจะดึงข้อมูลหน้าใหม่ทันที
  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage]);

  // ฟังก์ชันจับคู่อินพุต: อัปเดตข้อมูลในช่องพิมพ์ของฟอร์มลง State `formData` แบบ Real-time
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value, // แมปตามชื่อ attribute 'name' ของแต่ละช่องพิมพ์
    });
  };

  // [CREATE & UPDATE] ฟังก์ชันจัดการเมื่อกดปุ่ม "บันทึกข้อมูล" ในฟอร์ม
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // กันไม่ให้หน้าเว็บทำการรีเฟรชตัวเอง

    // 2.2.2 & 2.2.3 Client-side Validation: ตรวจสอบความว่างเปล่าของข้อมูล
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

    // 2.2.3.4 ตรวจสอบรูปแบบอีเมล (Email Format Validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.requester_email)) {
      alert("กรุณากรอกอีเมลให้อยู่ในรูปแบบที่ถูกต้อง (เช่น name@email.com)");
      return;
    }

    try {
      if (editingId) {
        // หากมีค่า editingId ให้ทำงานในฐานะโหมด [แก้ไขข้อมูล] (PUT)
        await axios.put(`${API_URL}/${editingId}`, formData);
        alert("บันทึกการเปลี่ยนแปลงสำเร็จ");
        setEditingId(null); // ล้าง ID ออกเพื่อกลับสู่โหมดเพิ่มข้อมูลปกติ
      } else {
        // หากไม่มีค่า editingId ให้ทำงานในฐานะโหมด [เพิ่มข้อมูลใหม่] (POST)
        await axios.post(API_URL, formData);
        alert("บันทึกคำขอเสร็จสิ้น");
      }

      // ล้างข้อมูลบนฟอร์มให้ว่างเปล่าหลังทำงานสำเร็จ
      setFormData({ title: "", request_type: "", requester_name: "", requester_email: "", description: "" });
      
      // สั่งดึงข้อมูลล่าสุดมาโชว์ในตารางใหม่
      fetchRequests(currentPage);
    } catch (error: any) {
      alert(error.response?.data?.error || "เกิดข้อผิดพลาดในการส่งข้อมูล");
    }
  };

  // ฟังก์ชันเมื่อกดปุ่ม "ดูรายละเอียด/แก้ไข" ในตารางข้อมูล
  const handleEditClick = async (id: number) => {
    try {
      // เรียก API ไปดึงข้อมูลแบบเจาะจงรายชิ้น เพื่อเอาค่าปัจจุบันมาสลัดลงในฟอร์ม
      const response = await axios.get(`${API_URL}/${id}`);
      setFormData({
        title: response.data.title,
        request_type: response.data.request_type,
        requester_name: response.data.requester_name,
        requester_email: response.data.requester_email,
        description: response.data.description || "",
      });
      setEditingId(id); // ล็อก ID นี้ไว้ เพื่อบอกให้แอปพลิเคชันรู้ว่าตอนนี้เปิดโหมดแก้ไขแล้ว
    } catch (error) {
      alert("ไม่สามารถดึงรายละเอียดไอเทมนี้ได้");
    }
  };

  // [DELETE] ฟังก์ชันลบรายการคำขอออกจากฐานข้อมูล (ทำงานสัมพันธ์กับระบบ Soft Delete หลังบ้าน)
  const handleDeleteClick = async () => {
    if (!editingId) return; // หากไม่ได้กดแก้ไขไอเทมใด ๆ อยู่ จะไม่ทำงาน
    
    // 2.4.2 แสดงหน้าต่างยืนยันผู้ใช้งานก่อนทำการลบออกจากระบบจริง
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบ Request นี้ออกจากระบบแพลตฟอร์มกลาง?")) {
      try {
        await axios.delete(`${API_URL}/${editingId}`);
        alert("ลบรายการคำขอออกจากระบบเรียบร้อยแล้ว");
        handleCancelEdit(); // ล้างฟอร์มกลับสู่สภาวะปกติ
        fetchRequests(currentPage); // รีเฟรชข้อมูลในตารางใหม่
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  // ฟังก์ชันสลัดโหมดแก้ไขทิ้ง หรือกดปุ่มยกเลิก เพื่อเคลียร์ฟอร์มให้ว่างเปล่า
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", request_type: "", requester_name: "", requester_email: "", description: "" });
  };

  // --------------------------------------------------------
  // 💻 RENDER COMPONENT (ส่วนของการวาดหน้าจอ UI)
  // --------------------------------------------------------
  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>POC - Request Management</h2>
      <hr />

      {/* 🧩 ส่วนประกอบฟอร์ม: ส่งผ่านข้อมูล Props และฟังก์ชันจัดการ Event ไปทำงานภายในคอมโพเนนต์ย่อย */}
      <RequestForm 
        formData={formData}
        editingId={editingId}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={handleCancelEdit}
        onDelete={handleDeleteClick}
      />

      {/* 🧩 ส่วนประกอบตารางข้อมูล: ส่งผ่านรายการ ข้อมูลหน้าปัจจุบัน และ Event การเปลี่ยนหน้าไปทำงานภายใน */}
      <RequestTable 
        requests={requests}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={fetchRequests} // เมื่อตารางสั่งเปลี่ยนหน้า มันจะเรียกฟังก์ชัน fetchRequests ทันที
        onEditClick={handleEditClick}
      />
    </div>
  );
}