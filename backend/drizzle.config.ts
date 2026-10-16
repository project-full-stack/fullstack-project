import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// 📂 โหลดค่าจากไฟล์ .env มาใช้งาน
dotenv.config();

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // 🔗 ให้อ่านจาก Environment Variable เป็นหลัก หรือใช้ค่าคอนฟิกของกลุ่ม 3 เป็นค่าสำรอง
    url: process.env.DATABASE_URL || 'postgres://g03:g03fs69@localhost:5432/reserve_db',
  },
});