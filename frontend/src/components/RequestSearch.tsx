import React from "react";

interface SearchQuery {
  title: string;
  requester_name: string;
}

interface SearchProps {
  searchQuery: SearchQuery;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent) => void; // ✨ เปลี่ยนจาก onSearchClick เป็นชื่อนี้
  onClearSearch: () => void;
}

export default function RequestSearch({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
}: SearchProps) {
  return (
    <div
      style={{
        background: "#e8f4fd",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "24px",
        border: "1px solid #bce0fd",
      }}
    >
      <h3 style={{ color: "#004085", marginTop: 0 }}>🔍 ค้นหารายการ Request</h3>

      <form onSubmit={onSearchSubmit}>
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "12px",
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: 1 }}>
            <label
              htmlFor="search_title"
              style={{ display: "block", marginBottom: "4px" }}
            >
              ค้นหาจากหัวข้อคำขอ:
            </label>
            <input
              id="search_title"
              type="text"
              name="title"
              value={searchQuery.title}
              onChange={onSearchChange}
              placeholder="พิมพ์คำสำคัญของหัวข้อ เช่น ตรวจการคัดลอก..."
              style={{
                width: "100%",
                padding: "8px",
                boxSizing: "border-box",
                borderRadius: "4px",
                border: "1px solid #ced4da",
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label
              htmlFor="search_name"
              style={{ display: "block", marginBottom: "4px" }}
            >
              ค้นหาจากชื่อผู้ส่งคำขอ:
            </label>
            <input
              id="search_name"
              type="text"
              name="requester_name"
              value={searchQuery.requester_name}
              onChange={onSearchChange}
              placeholder="พิมพ์ชื่อผู้ส่ง..."
              style={{
                width: "100%",
                padding: "8px",
                boxSizing: "border-box",
                borderRadius: "4px",
                border: "1px solid #ced4da",
              }}
            />
          </div>

          <div>
            <button
              type="submit"
              style={{
                background: "#007bff",
                color: "#fff",
                border: "none",
                padding: "9px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "8px",
                fontWeight: "bold",
              }}
            >
              ค้นหา
            </button>
            <button
              type="button"
              onClick={onClearSearch}
              style={{
                background: "#6c757d",
                color: "#fff",
                border: "none",
                padding: "9px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ล้างค่า
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
