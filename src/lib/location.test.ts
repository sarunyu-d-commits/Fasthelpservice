import { describe, expect, it } from "vitest";
import {
  formatDistance,
  haversineDistanceKm,
  isValidCoordinate,
  osmEmbed,
  osmLink,
} from "./location";

describe("location helpers", () => {
  it("ตรวจสอบพิกัดที่ถูกต้อง", () => {
    expect(isValidCoordinate(13.7563, 100.5018)).toBe(true);
    expect(isValidCoordinate(91, 0)).toBe(false);
    expect(isValidCoordinate(0, 181)).toBe(false);
    expect(isValidCoordinate(null, 100)).toBe(false);
  });

  it("คำนวณระยะทางด้วย haversine", () => {
    const distance = haversineDistanceKm(13.7563, 100.5018, 13.746, 100.511);
    expect(distance).toBeGreaterThan(1);
    expect(distance).toBeLessThan(3);
  });

  it("จัดรูปแบบระยะทาง", () => {
    expect(formatDistance(0.25)).toBe("250 ม.");
    expect(formatDistance(4.27)).toBe("4.3 กม.");
  });

  it("สร้างลิงก์และ embed ของ OpenStreetMap", () => {
    expect(osmLink(13.7563, 100.5018, "บ้าน")).toContain("marker=13.7563,100.5018");
    expect(osmEmbed(13.7563, 100.5018)).toContain("export/embed.html");
  });
});
