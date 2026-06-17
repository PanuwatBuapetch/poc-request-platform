import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const query = (text, params) => pool.query(text, params);

// ========================================================
// [READ ALL] 2.1 แสดงรายการคำขอ (ครั้งละ 10 รายการ, เรียงจากน้อยไปมาก, ซ่อน Soft Delete)
// ========================================================
app.get('/api/requests', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const countResult = await query('SELECT COUNT(*) FROM requests WHERE deleted_at IS NULL');
    const totalRequests = parseInt(countResult.rows[0].count);

    const sql = `
      SELECT id, title, request_type, requester_name, requester_email, created_at, status, description
      FROM requests 
      WHERE deleted_at IS NULL 
      ORDER BY id ASC 
      LIMIT $1 OFFSET $2
    `;
    const result = await query(sql, [limit, offset]);

    res.json({
      data: result.rows,
      totalPages: Math.ceil(totalRequests / limit) || 1,
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการทั้งหมด' });
  }
});

// ========================================================
// [CREATE] 2.2 เพิ่มรายการ Request ใหม่ (เซ็ตเวลาสร้างครั้งแรก)
// ========================================================
app.post('/api/requests', async (req, res) => {
  const { title, request_type, requester_name, requester_email, description } = req.body;

  if (!title || !request_type || !requester_name || !requester_email || !description) {
    res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนทุกช่อง' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(requester_email)) {
    res.status(400).json({ error: 'รูปแบบอีเมลผู้ส่งคำขอไม่ถูกต้อง' });
    return;
  }

  try {
    const sql = `
      INSERT INTO requests (title, request_type, requester_name, requester_email, description, status, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) 
      RETURNING id, title, request_type, requester_name, requester_email, status, created_at
    `;
    const result = await query(sql, [title, request_type, requester_name, requester_email, description, 'รอการดำเนินการ']);
    res.status(201).json({ message: 'บันทึกคำขอสำเร็จ', data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลคำขอใหม่' });
  }
});

// ========================================================
// [SEARCH] ค้นหาข้อมูล Request (แก้ไขให้ส่งข้อมูลกลับไปหน้าบ้านสำเร็จจริง)
// ========================================================
app.get('/api/requests/search', async (req, res) => {
  const { title, requester_name } = req.query;
  try {
    let sql = `
        SELECT id, title, request_type, requester_name, requester_email, created_at, status, description
        FROM requests 
        WHERE deleted_at IS NULL
    `;
    const params = [];
    let paramIndex = 1;

    if (title) {
      sql += ` AND title LIKE $${paramIndex++}`;
      params.push(`%${title}%`);
    }
    
    if (requester_name) {
      sql += ` AND requester_name LIKE $${paramIndex++}`;
      params.push(`%${requester_name}%`);
    }

    const result = await query(sql, params);
    // 🌟 แก้ไข: ส่งผลลัพธ์ข้อมูลกลับไปหาหน้าบ้าน เพื่อไม่ให้ฟังก์ชันค้าง
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการค้นหาข้อมูล' });
  }
});

// ========================================================
// [READ SINGLE] 2.3.2 ดึงรายละเอียด Request รายตัว
// ========================================================
app.get('/api/requests/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `
      SELECT id, title, request_type, requester_name, requester_email, description, status, created_at 
      FROM requests 
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const result = await query(sql, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'ไม่พบรายการคำขอนี้ หรืออาจถูกลบไปแล้ว' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงรายละเอียดข้อมูล' });
  }
});

// ========================================================
// [UPDATE] 2.3 แก้ไขข้อมูลรายการ Request (สลักวันเวลาอัปเดตใหม่ล่าสุดอัตโนมัติ)
// ========================================================
app.put('/api/requests/:id', async (req, res) => {
  const { id } = req.params;
  const { title, request_type, requester_name, requester_email, description, status } = req.body;

  if (!title || !request_type || !requester_name || !requester_email || !description || !status) {
    res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนทุกช่อง' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(requester_email)) {
    res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' });
    return;
  }

  try {
    // 🕒 มั่นใจได้ 100%: ทุกครั้งที่มีการกดบันทึกแก้ไขจากหน้าบ้าน ลอจิก SQL บรรทัดนี้จะบังคับอัปเดต
    // ค่า created_at (หรือเวลาประวัติคำขอ) ให้เป็น CURRENT_TIMESTAMP ของวินาทีที่กดบันทึกจริงทันทีครับ
    const sql = `
      UPDATE requests 
      SET title = $1, request_type = $2, requester_name = $3, requester_email = $4, description = $5, status = $6, created_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND deleted_at IS NULL 
      RETURNING id
    `;
    const result = await query(sql, [title, request_type, requester_name, requester_email, description, status, id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'ไม่พบรายการคำขอนี้ หรืออาจถูกลบไปแล้ว' });
      return;
    }

    res.json({ message: 'อัปเดตข้อมูลสำเร็จ' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลคำขอ' });
  }
});

// ========================================================
// [DELETE] 2.4 ลบรายการ Request แบบ Soft Delete
// ========================================================
app.delete('/api/requests/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `
      UPDATE requests 
      SET deleted_at = CURRENT_TIMESTAMP 
      WHERE id = $1 AND deleted_at IS NULL 
      RETURNING id
    `;
    const result = await query(sql, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'ไม่พบรายการคำขอ หรืออาจถูกลบไปแล้ว' });
      return;
    }
    res.json({ message: 'ลบรายการคำขอแบบ Soft Delete เรียบร้อยแล้ว' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});