import { describe, expect, it } from "vitest";
import { buildPromptPayPayload } from "./promptpay";

describe("buildPromptPayPayload", () => {
  it("builds a phone-number payload with amount", () => {
    expect(buildPromptPayPayload("0812345678", 600)).toBe(
      "00020101021229370016A0000006770101110113006681234567853037645406600.005802TH630499DD",
    );
  });

  it("omits the amount field when amount is zero", () => {
    const payload = buildPromptPayPayload("0812345678", 0);
    expect(payload).toBe(
      "00020101021129370016A0000006770101110113006681234567853037645802TH6304823E",
    );
    expect(payload).not.toContain("5406");
  });

  it("supports national ID numbers", () => {
    expect(buildPromptPayPayload("1-2345-67890-12-3", 1234.5)).toBe(
      "00020101021229370016A00000067701011102131234567890123530376454071234.505802TH63046625",
    );
  });

  it("returns an empty string when no digits are provided", () => {
    expect(buildPromptPayPayload("abc", 100)).toBe("");
  });

  it("always ends with a 4-character CRC checksum", () => {
    expect(buildPromptPayPayload("0812345678", 99)).toMatch(/[0-9A-F]{4}$/);
  });
});
