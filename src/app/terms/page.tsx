import type { Metadata } from "next";

export const metadata: Metadata = { title: "ข้อกำหนดการใช้งาน" };

const SECTIONS = [
  {
    title: "1. การใช้บริการ",
    body: "FastHelp เป็นแพลตฟอร์มที่ช่วยเชื่อมต่อลูกค้ากับผู้ให้บริการช่างในพื้นที่ ผู้ใช้ต้องให้ข้อมูลที่ถูกต้องและเป็นความจริงในการสมัครและการจองบริการ",
  },
  {
    title: "2. บัญชีผู้ใช้",
    body: "ผู้ใช้มีหน้าที่รักษารหัสผ่านของตนเอง ไม่ควรเปิดเผยข้อมูลบัญชีให้ผู้อื่น และต้องแจ้งทันทีหากพบการใช้งานผิดปกติ",
  },
  {
    title: "3. การจองและชำระเงิน",
    body: "ราคาที่แสดงเป็นราคาเริ่มต้น ราคาจริงอาจเปลี่ยนแปลงตามขอบเขตงาน ระบบชำระเงินผ่าน PromptPay ในเวอร์ชันนี้เป็นแบบสาธิต ควรตรวจสอบข้อมูลก่อนชำระเงินทุกครั้ง",
  },
  {
    title: "4. การยกเลิก",
    body: "ลูกค้าสามารถยกเลิกงานที่ยังไม่เริ่มดำเนินการได้ ผู้ให้บริการต้องแจ้งล่วงหน้าหากไม่สามารถให้บริการได้",
  },
  {
    title: "5. ข้อจำกัดความรับผิด",
    body: "FastHelp เป็นตัวกลางในการเชื่อมต่อเท่านั้น ไม่ได้เป็นคู่สัญญาโดยตรงกับผู้ให้บริการ และไม่รับผิดชอบต่อความเสียหายที่เกิดจากงานบริการ เว้นแต่กฎหมายกำหนด",
  },
  {
    title: "6. การเปลี่ยนแปลงข้อกำหนด",
    body: "เราอาจปรับปรุงข้อกำหนดนี้เป็นครั้งคราว การใช้งานต่อหลังการเปลี่ยนแปลงถือว่ายอมรับข้อกำหนดฉบับใหม่",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
        ข้อกำหนด
      </p>
      <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">
        ข้อกำหนดการใช้งาน
      </h1>
      <p className="mt-1 text-sm text-slate-500">อัปเดตล่าสุด: พฤศจิกายน 2026</p>

      <div className="mt-6 space-y-5 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-card">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-display font-bold text-ink">{section.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
