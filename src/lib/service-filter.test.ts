import { describe, expect, it } from "vitest";
import { filterServices } from "./service-filter";
import type { Service } from "./types";

function makeService(
  id: string,
  name: string,
  category: string,
  description: string | null = null,
): Service {
  return {
    id,
    slug: id,
    name,
    description,
    category,
    icon: null,
    base_price: 500,
    unit: "ครั้ง",
    duration_minutes: 60,
    is_active: true,
    sort_order: 1,
  };
}

const services = [
  makeService("1", "ล้างแอร์", "ทำความสะอาด", "ล้างแอร์บ้าน"),
  makeService("2", "ทำความสะอาดบ้าน", "ทำความสะอาด", "กวาดพื้น"),
  makeService("3", "เปลี่ยนแบตเตอรี่", "ซ่อมรถ", "แบตเตอรี่รถยนต์"),
];

describe("filterServices", () => {
  it("คืนทั้งหมดเมื่อไม่มีตัวกรอง", () => {
    expect(filterServices(services, {})).toHaveLength(3);
  });

  it("กรองตามหมวด", () => {
    expect(
      filterServices(services, { category: "ทำความสะอาด" }).map((s) => s.id),
    ).toEqual(["1", "2"]);
  });

  it("ค้นหาจากชื่อ คำอธิบาย และหมวด (ไม่สนตัวพิมพ์)", () => {
    expect(filterServices(services, { query: "AIR" })).toHaveLength(0);
    expect(
      filterServices(services, { query: "แอร์" }).map((s) => s.id),
    ).toEqual(["1"]);
    expect(
      filterServices(services, { query: "รถยนต์" }).map((s) => s.id),
    ).toEqual(["3"]);
    expect(
      filterServices(services, { query: "ซ่อม" }).map((s) => s.id),
    ).toEqual(["3"]);
  });

  it("ตัดช่องว่างและรวมหมวดกับคำค้นหา", () => {
    expect(
      filterServices(services, {
        category: "ทำความสะอาด",
        query: "  กวาด  ",
      }).map((s) => s.id),
    ).toEqual(["2"]);
  });

  it("คืนรายการว่างเมื่อไม่ตรง", () => {
    expect(filterServices(services, { query: "ไม่มีบริการนี้" })).toEqual([]);
  });
});
