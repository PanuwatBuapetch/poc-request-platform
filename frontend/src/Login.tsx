import React, { useState } from "react";
import axios from "axios";

interface LoginProps {
  onLoginSuccess: (adminData: { username: string; role: string }) => void;
  onSkipToUser: () => void;
}

export default function Login({ onLoginSuccess, onSkipToUser }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ยิงไปหา API เส้นที่เราเพิ่งเขียนและเทสผ่าน Postman เมื่อกี้เป๊ะๆ
      const response = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });

      alert(response.data.message);
      // ส่งสิทธิ์แอดมินกลับไปบอกไฟล์แม่ (App.tsx)
      onLoginSuccess(response.data.user);
    } catch (error: any) {
      alert(error.response?.data?.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f0f2f5", fontFamily: "sans-serif" }}>
      <div style={{ background: "#fff", padding: "40px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "24px", color: "#333" }}>🔒 Admin Login</h2>
        <form onSubmit={handleFormSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="username" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Username:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="กรอกชื่อผู้ใช้ (admin)"
              style={{ width: "100%", padding: "10px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
              required
            />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label htmlFor="password" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน (password123)"
              style={{ width: "100%", padding: "10px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
              required
            />
          </div>
          <button type="submit" style={{ width: "100%", padding: "12px", backgroundColor: "#198754", color: "white", border: "none", borderRadius: "4px", fontSize: "16px", cursor: "pointer", fontWeight: "bold", marginBottom: "12px" }}>
            เข้าสู่ระบบแอดมิน
          </button>
        </form>
        
        <hr style={{ border: "0", borderTop: "1px solid #eee", margin: "20px 0" }} />
        
        <button type="button" onClick={onSkipToUser} style={{ width: "100%", padding: "12px", backgroundColor: "#0d6efd", color: "white", border: "none", borderRadius: "4px", fontSize: "16px", cursor: "pointer", fontWeight: "bold" }}>
          🙋‍♂️ เข้าใช้งานทั่วไป (โหมด User)
        </button>
      </div>
    </div>
  );
}