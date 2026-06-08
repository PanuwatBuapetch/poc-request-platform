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
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/poc_request_management'
});

const query = (text, params) => pool.query(text, params);

// [READ ALL] 2.1 แสดงรายการคำขอ (ครั้งละ 10 รายการ, เรียงจากน้อยไปมาก, ซ่อน Soft Delete)
app.get('/api/requests', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    // กรองนับเฉพาะรายการที่ยังไม่โดนลบ (deleted_at IS NULL)
    const countResult = await query('SELECT COUNT(*) FROM requests WHERE deleted_at IS NULL');
    const totalRequests = parseInt(countResult.rows[0].count);

    const sql = `
      SELECT id, title, request_type, requester_name, requester_email, created_at 
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

// [CREATE] 2.2 เพิ่มรายการ Request ใหม่ + ตรวจสอบข้อมูล (Server-side Validation)
app.post('/api/requests', async (req, res) => {
  const { title, request_type, requester_name, requester_email, description } = req.body;

  // 2.2.2 & 2.2.3 ตรวจสอบ Input ต้องกรอกครบถ้วน
  if (!title || !request_type || !requester_name || !requester_email || !description) {
    res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนทุกช่อง' });
    return;
  }

  // 2.2.3.4 ตรวจสอบรูปแบบอีเมล
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(requester_email)) {
    res.status(400).json({ error: 'รูปแบบอีเมลผู้ส่งคำขอไม่ถูกต้อง' });
    return;
  }

  try {
    const sql = `
      INSERT INTO requests (title, request_type, requester_name, requester_email, description) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, title, request_type, requester_name, requester_email, created_at
    `;
    const result = await query(sql, [title, request_type, requester_name, requester_email, description]);
    res.status(201).json({ message: 'บันทึกคำขอสำเร็จ', data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลคำขอใหม่' });
  }
});

// [READ SINGLE] 2.3.2 ดึงรายละเอียด Request รายตัวสลัดลงฟอร์มแก้ไข
app.get('/api/requests/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `
      SELECT id, title, request_type, requester_name, requester_email, description, created_at 
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

// [UPDATE] 2.3 แก้ไขข้อมูลรายการ Request
app.put('/api/requests/:id', async (req, res) => {
  const { id } = req.params;
  const { title, request_type, requester_name, requester_email, description } = req.body;

  // 2.3.3 ตรวจสอบ Input แบบเดียวกับการเพิ่มข้อมูล
  if (!title || !request_type || !requester_name || !requester_email || !description) {
    res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(requester_email)) {
    res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' });
    return;
  }

  try {
    const sql = `
      UPDATE requests 
      SET title = $1, request_type = $2, requester_name = $3, requester_email = $4, description = $5 
      WHERE id = $6 AND deleted_at IS NULL 
      RETURNING id
    `;
    await query(sql, [title, request_type, requester_name, requester_email, description, id]);
    res.json({ message: 'อัปเดตข้อมูลสำเร็จ' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลคำขอ' });
  }
});

// [DELETE] 2.4 ลบรายการ Request แบบ Soft Delete บันทึกวันเวลาลงเบส
app.delete('/api/requests/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 2.4.3 บันทึกวันและเวลาที่ลบ (CURRENT_TIMESTAMP) แทนการใช้ DELETE FROM
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