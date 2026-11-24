import { describe, expect, it } from "vitest";
import { isAuthPath } from "./navigation";

describe("isAuthPath", () => {
  it("ตรวจจับหน้าล็อกอินและสมัครสมาชิก", () => {
    expect(isAuthPath("/login")).toBe(true);
    expect(isAuthPath("/register")).toBe(true);
  });

  it("ตรวจจับหน้ารีเซ็ตรหัสผ่าน", () => {
    expect(isAuthPath("/forgot-password")).toBe(true);
    expect(isAuthPath("/reset-password")).toBe(true);
  });

  it("รองรับ pathname ที่มี slash ต่อท้าย", () => {
    expect(isAuthPath("/login/")).toBe(true);
  });

  it("ไม่ตรวจจับหน้าที่ใช้งานปกติเป็นหน้ายืนยันตัวตน", () => {
    expect(isAuthPath("/")).toBe(false);
    expect(isAuthPath("/services")).toBe(false);
    expect(isAuthPath("/bookings/abc123")).toBe(false);
  });
});
