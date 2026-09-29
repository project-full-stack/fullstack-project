import { pgTable, serial, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const resources = pgTable('resources', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  resourceId: serial('resource_id').references(() => resources.id).notNull(),
  studentName: text('student_name').notNull(),
  studentId: text('student_id').notNull(),
  status: text('status').default('pending').notNull(),
  bookingDate: timestamp('booking_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});