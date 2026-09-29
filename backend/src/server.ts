import express from 'express';
import cors from 'cors';
import { db } from './db';
import { resources, bookings } from './db/schema';
import { eq } from 'drizzle-orm';

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// 1. Health Check Endpoint
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

    if (!resourceId || !studentName || !studentId || !bookingDate) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

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

// 4. Get Bookings Endpoint
app.get('/bookings', async (req, res) => {
  try {
    const result = await db.select().from(bookings);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. Get Bookings by Student ID Endpoint (รองรับชื่อ 2 ภาษา th/en)
app.get('/bookings/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const studentBookings = await db
      .select({
        id: bookings.id,
        resourceId: bookings.resourceId,
        resourceNameTh: resources.nameTh, // ✅ ดึงชื่อไทย
        resourceNameEn: resources.nameEn, // ✅ ดึงชื่ออังกฤษ
        resourceType: resources.type,
        studentName: bookings.studentName,
        studentId: bookings.studentId,
        status: bookings.status,
        bookingDate: bookings.bookingDate,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .leftJoin(resources, eq(bookings.resourceId, resources.id))
      .where(eq(bookings.studentId, studentId));

    res.json(studentBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch student bookings' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});