import express from 'express';
import cors from 'cors';
import { db } from './db';
import { resources, bookings } from './db/schema'; // เพิ่ม bookings เข้ามาตรงนี้
import { eq } from 'drizzle-orm';

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// 1. Health Check Endpoint (ให้หน้าเว็บเช็กว่าระบบออนไลน์ไหม)
app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Backend is running smoothly' });
});

// 2. Get Resources Endpoint (ดึงข้อมูลห้อง/อุปกรณ์ ทั้งหมด หรือแยกตามประเภท)
app.get('/resources', async (req, res) => {
  try {
    const { type } = req.query;
    
    let result;
    if (type && typeof type === 'string') {
      result = await db.select().from(resources).where(eq(resources.type, type));
    } else {
      result = await db.select().from(resources);
    }
    
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. Create Booking Endpoint (รับข้อมูลการจองจากหน้าเว็บ)
app.post('/bookings', async (req, res) => {
  try {
    const { resourceId, studentName, studentId, bookingDate } = req.body;

    // ตรวจสอบข้อมูลเบื้องต้นว่ามาครบไหม
    if (!resourceId || !studentName || !studentId || !bookingDate) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // บันทึกลงฐานข้อมูลผ่าน Drizzle ORM
    const newBooking = await db.insert(bookings).values({
      resourceId: Number(resourceId),
      studentName,
      studentId,
      bookingDate: new Date(bookingDate),
      status: 'pending',
    }).returning();

    res.status(201).json({
      success: true,
      message: 'จองสำเร็จเรียบร้อย',
      data: newBooking[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลการจอง' });
  }
});

// 4. Get Bookings Endpoint (ดึงรายการจองทั้งหมดมาเช็กดู)
app.get('/bookings', async (req, res) => {
  try {
    const result = await db.select().from(bookings);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});