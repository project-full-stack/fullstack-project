import { pgTable, serial, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

export const resources = pgTable('resources', {
  id: serial('id').primaryKey(),
  nameTh: text('name_th').notNull(),
  nameEn: text('name_en').notNull(),
  type: text('type').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  resourceId: integer('resource_id').references(() => resources.id).notNull(),
  studentName: text('student_name').notNull(),
  studentId: text('student_id').notNull(),
  email: text('email').notNull(),
  status: text('status').default('pending').notNull(),
  bookingDate: timestamp('booking_date').notNull(),
  endTime: text('end_time').notNull(), 
  borrowDays: integer('borrow_days'), // ✅ เพิ่มคอลัมน์เก็บจำนวนวันที่ยืมจริง
  lang: text('lang').default('th').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(), 
  createdAt: timestamp('created_at').defaultNow().notNull(),
});