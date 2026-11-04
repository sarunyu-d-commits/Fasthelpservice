import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, formatTHB, formatTime } from "./format";

describe("formatTHB", () => {
  it("formats whole baht amounts without decimals", () => {
    expect(formatTHB(600)).toBe("฿600");
    expect(formatTHB(2500)).toBe("฿2,500");
  });
});

describe("date formatting in Asia/Bangkok", () => {
  const sample = new Date("2026-11-04T00:30:00Z");

  it("formats a date", () => {
    expect(formatDate(sample)).toBe("4 พ.ย. 2569");
  });

  it("formats a time", () => {
    expect(formatTime(sample)).toBe("07:30");
  });

  it("formats a date and time", () => {
    expect(formatDateTime(sample)).toBe("4 พ.ย. 2569 07:30");
  });
});
