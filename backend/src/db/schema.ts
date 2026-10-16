import { pgTable, serial, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

// 🏢 1. ตารางเก็บข้อมูลทรัพยากร (ห้อง และ อุปกรณ์)
export const resources = pgTable('resources', {
  id: serial('id').primaryKey(),
  nameTh: text('name_th').notNull(), // ชื่อภาษาไทย
  nameEn: text('name_en').notNull(), // ชื่อภาษาอังกฤษ
  type: text('type').notNull(),       // ประเภท ('room' หรือ 'equipment')
  isActive: boolean('is_active').default(true).notNull(), // สถานะเปิดใช้งาน
  createdAt: timestamp('created_at').defaultNow().notNull(), // วันที่สร้างข้อมูล
});

// 📋 2. ตารางเก็บข้อมูลการจองทรัพยากร
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  resourceId: integer('resource_id').references(() => resources.id).notNull(), // อ้างอิง ID ทรัพยากร
  studentName: text('student_name').notNull(), // ชื่อ-นามสกุลผู้จอง
  studentId: text('student_id').notNull(),     // รหัสนักศึกษา 9 หลัก
  email: text('email').notNull(),             // อีเมลสำหรับรับการแจ้งเตือน
  status: text('status').default('pending').notNull(), // สถานะการจอง (pending, approved, rejected, borrowed, returned)
  bookingDate: timestamp('booking_date').notNull(), // วันที่และเวลาเริ่มต้นใช้งาน
  endTime: text('end_time').notNull(),         // เวลาสิ้นสุด หรือ 'Pickup at Counter'
  borrowDays: integer('borrow_days'),         // ⏱️ จำนวนวันที่ยืมอุปกรณ์จริง
  lang: text('lang').default('th').notNull(), // ภาษาที่ใช้ตอนทำรายการ ('th' หรือ 'en')
  createdAt: timestamp('created_at').defaultNow().notNull(), // วันที่กดจอง
});

// 🔐 3. ตารางเก็บข้อมูลผู้ดูแลระบบ (Admins)
export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(), // ชื่อผู้ใช้งานแอดมิน
  password: text('password').notNull(),          // รหัสผ่าน
  createdAt: timestamp('created_at').defaultNow().notNull(), // วันที่สร้างแอดมิน
});