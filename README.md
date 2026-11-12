# FastHelp

แอปเรียกช่างและบริการถึงบ้าน — ล้างแอร์ ทำความสะอาด เปลี่ยนแบตเตอรี่ ซ่อมไฟฟ้า และอื่น ๆ

สร้างด้วย Next.js 16 (App Router) + Tailwind CSS + Supabase และพร้อมต่อยอดเป็นแอป iOS/Android ผ่าน Capacitor

## ฟีเจอร์

- สมัคร/เข้าสู่ระบบด้วยอีเมล (Supabase Auth) แยกบทบาทลูกค้า/ผู้ให้บริการ
- แค็ตตาล็อกบริการ + หมวดหมู่ + หน้ารายละเอียด
- จองคิว เลือกวันเวลา ที่อยู่ และรายละเอียดงาน
- แดชบอร์ดช่าง: รับงาน อัปเดตสถานะ ดูข้อมูลลูกค้า
- แชทระหว่างลูกค้าและช่าง (Supabase Realtime)
- ชำระเงินด้วย PromptPay QR (เดโม: ยืนยันการชำระด้วยตนเอง)
- รีวิวและให้คะแนนผู้ให้บริการ
- PWA (ติดตั้งบนมือถือได้) + โครง Capacitor สำหรับ App Store / Play Store

## เริ่มต้นใช้งาน

```bash
npm install
cp .env.example .env.local
```

แก้ไข `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
NEXT_PUBLIC_PROMPTPAY_ID=0812345678
NEXT_PUBLIC_PROMPTPAY_NAME=FastHelp
```

จากนั้นรัน `npm run dev` เปิด http://localhost:3000

เว็บและแอป Expo (`mobile/`) ใช้โปรเจกต์ Supabase **ชุดเดียวกัน** — ใส่ URL และ anon key
ค่าเดียวกันทั้ง `NEXT_PUBLIC_*` (เว็บ) และ `EXPO_PUBLIC_*` (แอป) ข้อมูลบริการ การจอง
โปรไฟล์ช่าง และแชทจึงถูกแชร์ระหว่างสองแพลตฟอร์มทันที

## ตั้งค่า Supabase

1. สร้างโปรเจกต์ที่ https://supabase.com
2. เปิด **SQL Editor** แล้วรันไฟล์ [`supabase/schema.sql`](supabase/schema.sql) ทั้งไฟล์
   - สร้างตาราง, RLS policies, triggers, realtime และข้อมูลบริการเริ่มต้น
   - หากเคยรันไปแล้ว ให้รันซ้ำเพื่ออัปเดต policy/trigger ล่าสุด
3. ไปที่ **Project Settings → API** คัดลอก `Project URL` และ `anon public key` ใส่ `.env.local`
4. (แนะนำสำหรับทดสอบ) **Authentication → Providers → Email** ปิด "Confirm email"
   เพื่อให้สมัครแล้วเข้าใช้งานได้ทันที

### บทบาทผู้ใช้

- เลือก "ลูกค้า" หรือ "ผู้ให้บริการ" ตอนสมัคร
- ผู้ให้บริการควรไปที่ **โปรไฟล์ช่าง** เพื่อเลือกบริการที่รับและพื้นที่ให้บริการ

## ชำระเงิน (เดโม)

- แสดง PromptPay QR จาก `NEXT_PUBLIC_PROMPTPAY_ID` และยอดเงินของการจอง
- ลูกค้ากด "ฉันชำระเงินแล้ว" เพื่อเปลี่ยนสถานะเป็นชำระแล้ว
- ยังไม่เชื่อมต่อเกตเวย์จริง หากต้องการต่อ Omise/Opn Payments หรือ Stripe
  ให้เพิ่ม API route และ webhook แล้วอัปเดต `payment_status` ในตาราง `bookings`

## ตรวจสอบโค้ด

```bash
npm run lint
npm run typecheck
npm run build
```

## Mobile app (Capacitor)

แอปนี้เป็น SSR จึงใช้ Capacitor เป็น wrapper โหลดเว็บที่ deploy แล้ว:

```bash
# ตั้ง URL ของเว็บที่ deploy (ต้องเป็น https)
$env:NEXT_PUBLIC_APP_URL="https://your-domain.com"

npm run cap:add:android   # ครั้งแรกครั้งเดียว
npm run cap:add:ios       # ครั้งแรกครั้งเดียว (ต้องใช้ macOS + Xcode)
npm run cap:sync
npm run cap:open:android  # เปิดใน Android Studio
npm run cap:open:ios      # เปิดใน Xcode
```

หรือติดตั้งเป็น PWA จากเบราว์เซอร์ (Add to Home Screen) ได้ทันที

## แอปมือถือ (Expo)

มีแอปเนทีฟใน `mobile/` ที่เชื่อม Supabase ชุดเดียวกับเว็บ:

```bash
cd mobile
npm install
cp .env.example .env
# ใส่ค่าเดียวกับ .env.local ของเว็บ แต่เปลี่ยน prefix เป็น EXPO_PUBLIC_
npm start
```

รัน `npm run lint` ใน `mobile/` เพื่อตรวจสอบโค้ดแอป

## โครงสร้างหลัก

```
src/app/                 หน้าเว็บและ server actions
src/components/          UI components
src/lib/data.ts          การดึงข้อมูลจาก Supabase
src/lib/supabase/        client/server/proxy helpers
supabase/schema.sql      schema + RLS + seed data
mobile/                  แอป Expo (ใช้ Supabase โปรเจกต์เดียวกับเว็บ)
public/                  manifest, service worker, icons
capacitor.config.ts      config สำหรับ iOS/Android
```
