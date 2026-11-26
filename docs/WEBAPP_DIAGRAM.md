# FastHelp Web App — Diagrams

Production: `https://fasthelp-kappa.vercel.app`
Stack: Next.js 16 (App Router) on Vercel + Supabase (`oaowgicupetabfdxburr`).

> หมายเหตุความปลอดภัย: เฉพาะ **publishable key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`) ที่ถูกส่งถึง browser ส่วน `VAPID_PRIVATE_KEY` อยู่ฝั่ง Vercel แบบ Secret เท่านั้น

---

## 1. Architecture

```mermaid
flowchart TB
  subgraph Browser["Browser / PWA"]
    UI["App Router UI<br/>Server + Client Components"]
    CC["Client components<br/>ChatBox · BookingForm · GoogleMap · PushSubscribe"]
    SW["/sw.js<br/>push · notificationclick"]
  end

  subgraph Vercel["Vercel (Production)"]
    Proxy["proxy.ts<br/>updateSession — cookie guard"]
    Pages["Pages<br/>ISR: / และ /services<br/>Dynamic: ที่เหลือ"]
    Actions["Server Actions<br/>auth · bookings · messages · reviews<br/>admin · profile · push"]
    PushLib["lib/push.ts<br/>web-push + VAPID private key"]
  end

  subgraph Supabase["Supabase"]
    Auth["Auth<br/>email/password · cookie session"]
    DB[("Postgres<br/>RLS + triggers · profiles · services<br/>bookings · messages · booking_reads<br/>reviews · push_subscriptions")]
    RT["Realtime<br/>postgres_changes + broadcast typing"]
    Storage[("Storage<br/>chat-images (private)<br/>signed URL")]
  end

  Maps["Google Maps<br/>keyless embed / optional API key"]
  Note["User device<br/>Web Push notification"]

  UI --> Proxy --> Pages
  Pages --> Actions
  CC --> Actions
  CC --> RT
  Actions --> Auth
  Actions --> DB
  Actions --> PushLib
  PushLib --> DB
  DB --> RT
  RT --> CC
  Actions --> Storage
  CC --> Storage
  Pages --> DB
  CC --> Maps
  PushLib --> Note
  Note --> SW
  SW --> Pages
```

---

## 2. Routes ตามบทบาท (Role-based navigation)

```mermaid
flowchart LR
  subgraph Public["Public (ไม่ต้องล็อกอิน)"]
    Home["/"]
    Services["/services<br/>/services/[slug]"]
    AuthPages["/login · /register<br/>/forgot-password · /reset-password"]
    Legal["/privacy · /terms"]
  end

  subgraph Customer["Customer"]
    Bookings["/bookings"]
    BookingDetail["/bookings/[id]<br/>แชท · แผนที่ · ชำระ · รีวิว"]
    Account["/account<br/>โปรไฟล์ · เปิด/ปิดการแจ้งเตือน"]
  end

  subgraph Provider["Provider"]
    Dashboard["/provider"]
    Job["/provider/jobs/[id]<br/>แชท · อัปเดตสถานะ"]
    ProviderProfile["/provider/profile"]
  end

  subgraph Admin["Admin"]
    AdminPage["/admin<br/>ยืนยันช่าง · เปิด/ปิดบริการ"]
  end

  AuthPages --> Customer
  AuthPages --> Provider
  AuthPages --> Admin
  Services --> Bookings
  Bookings --> BookingDetail
  BookingDetail --> Account
  Dashboard --> Job
  Dashboard --> ProviderProfile
  AdminPage -.->|verify / toggle| Provider
  AdminPage -.->|toggle| Services
```

---

## 3. วงจรการจอง (Booking lifecycle)

```mermaid
stateDiagram-v2
  [*] --> Pending: customer สร้างงาน
  Pending --> Accepted: provider รับงาน
  Pending --> Cancelled: customer ยกเลิก
  Accepted --> Cancelled: customer ยกเลิก
  Accepted --> InProgress: provider เริ่มงาน
  InProgress --> Completed: provider จบงาน
  Completed --> Reviewed: customer รีวิว
  Reviewed --> [*]

  note right of Accepted
    customer จ่ายเงิน: unpaid -> paid
    (provider แก้ payment_status ไม่ได้)
  end note

  note right of Completed
    ส่ง Web Push แจ้งสถานะ/ชำระ/รีวิว
  end note
```

---

## 4. Realtime Chat + การแจ้งเตือน

```mermaid
sequenceDiagram
  participant A as Sender browser
  participant SA as Server Action (messages)
  participant DB as Supabase Postgres
  participant RT as Supabase Realtime
  participant P as Web Push (VAPID)
  participant B as Recipient browser

  A->>SA: sendMessage(bookingId, text/image/location)
  SA->>DB: INSERT messages (RLS: booking participant)
  DB-->>RT: postgres_changes INSERT
  RT-->>B: ข้อความใหม่ (real-time)
  B->>DB: poll messages ทุก 4s (fallback ถ้า event หาย)
  SA->>P: sendPushToUser(recipientId)
  P->>B: notification → /sw.js → แสดง notification
  B->>DB: upsert booking_reads (last_read_at)
  DB-->>RT: read state เปลี่ยน
  RT-->>A: read receipt
  A->>RT: broadcast typing
  RT-->>B: แสดง "กำลังพิมพ์..."
  B->>DB: /upload ภาพใน chat-images → signed URL
```

---

## 5. Security / Authorization flow

```mermaid
flowchart TB
  Req["Request<br/>publishable key + session cookie"] --> Proxy["proxy.ts<br/>มี session หรือไม่?"]
  Proxy -- ไม่มี --> Login["redirect /login?next=..."]
  Proxy -- มี --> Page["Page: getSessionUser + getProfile"]
  Page --> Guard{"role ตรงตามหน้า<br/>หรือเป็น participant?"}
  Guard -- ไม่ใช่ --> Account["redirect /account หรือ /bookings"]
  Guard -- ใช่ --> Action["Server Action"]
  Action --> RLS["Postgres RLS + triggers<br/>is_admin · is_provider<br/>is_booking_participant<br/>prevent_role_change<br/>guard_provider_verification<br/>guards ของ bookings"]
  RLS --> Result["เฉพาะแถวที่อนุญาตเท่านั้นที่อ่าน/แก้ได้"]
```

---

## 6. สรุปจุดที่ QA แล้วผ่าน

| ส่วน | ผล |
|---|---|
| Flow จอง→รับงาน→สถานะ→ชำระ→รีวิว | 29/29 |
| Realtime ข้าม user (message/read/typing) | 3/3 |
| Admin RLS + ปิดช่องโหว่ self-verify | 11/11 |
| Load test (read-only pages) | 300 VU, 0 error, p95 ~110 ms |
| Push UI + Service Worker | ปุ่มใน /account, VAPID ใน client chunk, push handler พร้อม |
