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

// 2. Get Resources Endpoint
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

// 3. Create Booking Endpoint (รองรับ endTime และระบบป้องกันการจองซ้ำ + เช็คเวลาอดีต)
app.post('/bookings', async (req, res) => {
  try {
    const { resourceId, studentName, studentId, bookingDate, endTime } = req.body;

    if (!resourceId || !studentName || !studentId || !bookingDate || !endTime) {
      return res.status(400).json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const bookingDateTime = new Date(bookingDate);
    const now = new Date();

    // 1. ตรวจสอบเวลาอดีต
    if (bookingDateTime < now) {
      return res.status(400).json({ success: false, error: 'ไม่สามารถจองวันที่หรือเวลาที่ผ่านไปแล้วได้' });
    }

    // แปลงเวลาสิ้นสุดของการจองใหม่เป็น Date object
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const bookingEndDateTime = new Date(bookingDateTime);
    bookingEndDateTime.setHours(endHours, endMinutes, 0, 0);

    // 2. ดึงข้อมูลการจองทั้งหมดของทรัพยากรนี้ เพื่อมาเช็คเวลาทับซ้อน
    const existingBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.resourceId, Number(resourceId)));

    // 3. วนลูปเช็คช่วงเวลาทับซ้อน (Overlap)
    for (const existing of existingBookings) {
      const existingStart = new Date(existing.bookingDate);
      
      const [exEndHours, exEndMinutes] = existing.endTime.split(':').map(Number);
      const existingEnd = new Date(existingStart);
      existingEnd.setHours(exEndHours, exEndMinutes, 0, 0);

      // เงื่อนไขเช็คการทับซ้อน: (StartA < EndB) และ (EndA > StartB)
      const isOverlap = bookingDateTime < existingEnd && bookingEndDateTime > existingStart;

      if (isOverlap) {
        return res.status(400).json({ 
          success: false, 
          error: 'ช่วงเวลานี้ถูกจองไปแล้วในระบบ กรุณาเลือกช่วงเวลาอื่น' 
        });
      }
    }

    // 4. บันทึกลงฐานข้อมูลเมื่อผ่านการตรวจสอบทั้งหมด
    const newBooking = await db.insert(bookings).values({
      resourceId: Number(resourceId),
      studentName,
      studentId,
      bookingDate: bookingDateTime,
      endTime: endTime,
      status: 'pending',
    }).returning();

    res.status(201).json({
      success: true,
      message: 'จองสำเร็จเรียบร้อย',
      data: newBooking[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลการจอง' });
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

// 5. Get Bookings by Student ID Endpoint
app.get('/bookings/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const studentBookings = await db
      .select({
        id: bookings.id,
        resourceId: bookings.resourceId,
        resourceNameTh: resources.nameTh,
        resourceNameEn: resources.nameEn,
        resourceType: resources.type,
        studentName: bookings.studentName,
        studentId: bookings.studentId,
        status: bookings.status,
        bookingDate: bookings.bookingDate,
        endTime: bookings.endTime,
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