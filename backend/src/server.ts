import express from 'express';
import cors from 'cors';
import { db } from './db';
import { resources, bookings, admins } from './db/schema';
import { eq } from 'drizzle-orm';
import nodemailer from 'nodemailer'; // ✅ นำเข้า nodemailer

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// ✅ ตั้งค่าตัวส่งอีเมล (Nodemailer)
// หมายเหตุ: แนะนำให้ใช้ Gmail และเปิดใช้ App Password 16 หลัก
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nweeranoi@gmail.com', 
    pass: 'qwytggggjofgasoh'     
  }
});

// ฟังก์ชันสำหรับส่งอีเมลแจ้งเตือนไปยังผู้จอง
const sendBookingEmail = async (toEmail: string, studentName: string, status: string, resourceName: string) => {
  try {
    const isApproved = status === 'approved';
    const subject = isApproved 
      ? 'แจ้งผลการจอง: การจองของคุณได้รับการอนุมัติแล้ว' 
      : 'แจ้งผลการจอง: การจองของคุณไม่ผ่านการอนุมัติ';
    
    const textMessage = isApproved
      ? `สวัสดีคุณ ${studentName},\n\nการจองทรัพยากร "${resourceName}" ของคุณได้รับการ "อนุมัติ" เรียบร้อยแล้ว กรุณามารับของหรือเข้าใช้งานตามกำหนดเวลาที่ฝ่ายครับ`
      : `สวัสดีคุณ ${studentName},\n\nขออภัย การจองทรัพยากร "${resourceName}" ของคุณ "ไม่ผ่านการอนุมัติ" เนื่องจากช่วงเวลาไม่ว่างหรือข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและทำการจองใหม่อีกครั้งครับ`;

    await transporter.sendMail({
      from: '"Room & Equipment Booking System" <noreply@booking.com>',
      to: toEmail,
      subject: subject,
      text: textMessage,
    });
    console.log(`Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};

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

// 3. Create Booking Endpoint (รองรับ email, endTime และระบบป้องกันการจองซ้ำ + เช็คเวลาอดีต)
app.post('/bookings', async (req, res) => {
  try {
    const { resourceId, studentName, studentId, email, bookingDate, endTime } = req.body;

    if (!resourceId || !studentName || !studentId || !email || !bookingDate || !endTime) {
      return res.status(400).json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วนรวมถึงอีเมล' });
    }

    const bookingDateTime = new Date(bookingDate);
    const now = new Date();

    if (bookingDateTime < now) {
      return res.status(400).json({ success: false, error: 'ไม่สามารถจองวันที่หรือเวลาที่ผ่านไปแล้วได้' });
    }

    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const bookingEndDateTime = new Date(bookingDateTime);
    bookingEndDateTime.setHours(endHours, endMinutes, 0, 0);

    const existingBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.resourceId, Number(resourceId)));

    for (const existing of existingBookings) {
      const existingStart = new Date(existing.bookingDate);
      
      const [exEndHours, exEndMinutes] = existing.endTime.split(':').map(Number);
      const existingEnd = new Date(existingStart);
      existingEnd.setHours(exEndHours, exEndMinutes, 0, 0);

      const isOverlap = bookingDateTime < existingEnd && bookingEndDateTime > existingStart;

      if (isOverlap) {
        return res.status(400).json({ 
          success: false, 
          error: 'ช่วงเวลานี้ถูกจองไปแล้วในระบบ กรุณาเลือกช่วงเวลาอื่น' 
        });
      }
    }

    // ✅ บันทึกลงฐานข้อมูลรวม email
    const newBooking = await db.insert(bookings).values({
      resourceId: Number(resourceId),
      studentName,
      studentId,
      email, // บันทึกอีเมล
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
        email: bookings.email, // ส่งอีเมลกลับไปด้วยถ้าจำเป็น
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

// ==========================================
// 6. ADMIN ENDPOINTS
// ==========================================

// 6.1 Admin Login Endpoint
app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await db
      .select()
      .from(admins)
      .where(eq(admins.username, username));

    if (admin.length === 0 || admin[0].password !== password) {
      return res.status(401).json({ success: false, error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' });
    }

    res.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// 6.2 Update Booking Status Endpoint (Approve / Reject) + ส่งอีเมลอัตโนมัติ
app.patch('/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // รับค่า 'approved' หรือ 'rejected' (หรือ 'declined')

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'สถานะไม่ถูกต้อง' });
    }

    // 1. อัปเดตสถานะในฐานข้อมูล
    const updated = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, Number(id)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ success: false, error: 'ไม่พบรายการจองนี้' });
    }

    const bookingInfo = updated[0];

    // ดึงชื่อทรัพยากรมาแสดงในเนื้อหาอีเมลให้ชัดเจน
    const resourceInfo = await db
      .select()
      .from(resources)
      .where(eq(resources.id, bookingInfo.resourceId));
    
    const resourceName = resourceInfo.length > 0 ? resourceInfo[0].nameTh : 'ทรัพยากร';

    // 2. ✅ ส่งอีเมลแจ้งเตือนไปยังผู้จองทันทีที่ Admin เปลี่ยนสถานะ (ถ้ามีอีเมล)
    if (bookingInfo.email) {
      await sendBookingEmail(bookingInfo.email, bookingInfo.studentName, status, resourceName);
    }

    res.json({ success: true, message: 'อัปเดตสถานะและส่งอีเมลแจ้งเตือนสำเร็จ', data: bookingInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});