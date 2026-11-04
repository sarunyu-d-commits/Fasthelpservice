import type { Metadata } from "next";

export const metadata: Metadata = { title: "นโยบายความเป็นส่วนตัว" };

const SECTIONS = [
  {
    title: "ข้อมูลที่เราเก็บ",
    body: "เราเก็บชื่อ อีเมล เบอร์โทรศัพท์ ที่อยู่สำหรับให้บริการ และประวัติการจอง เพื่อใช้ในการให้บริการและติดต่อประสานงาน",
  },
  {
    title: "การเปิดเผยข้อมูล",
    body: "ข้อมูลติดต่อและที่อยู่จะแสดงเฉพาะผู้ที่เกี่ยวข้องกับการจอง เช่น ลูกค้าและช่างที่รับงานนั้นเท่านั้น เบอร์โทรของช่างจะไม่แสดงต่อสาธารณะ",
  },
  {
    title: "การรักษาความปลอดภัย",
    body: "เราใช้ระบบยืนยันตัวตนและสิทธิ์การเข้าถึงข้อมูล (Row Level Security) ของ Supabase เพื่อจำกัดการเข้าถึงข้อมูลตามบทบาทของผู้ใช้",
  },
  {
    title: "คุกกี้",
    body: "เราใช้คุกกี้ที่จำเป็นสำหรับการเข้าสู่ระบบและจดจำเซสชันของผู้ใช้ ไม่ได้ใช้เพื่อการโฆษณา",
  },
  {
    title: "สิทธิ์ของผู้ใช้",
    body: "ผู้ใช้สามารถแก้ไขข้อมูลส่วนตัวได้ที่หน้าบัญชีของฉัน และสามารถขอลบบัญชีได้โดยติดต่อผู้ดูแลระบบ",
  },
  {
    title: "การติดต่อ",
    body: "หากมีคำถามเกี่ยวกับความเป็นส่วนตัว สามารถติดต่อทีมงาน FastHelp ผ่านช่องทางที่ระบุไว้ในแอป",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">นโยบายความเป็นส่วนตัว</h1>
      <p className="mt-1 text-sm text-slate-500">อัปเดตล่าสุด: พฤศจิกายน 2026</p>

      <div className="mt-6 space-y-5">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-semibold text-slate-900">{section.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
