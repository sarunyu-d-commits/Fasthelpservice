function field(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function crc16(input: string) {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * สร้าง payload สำหรับ PromptPay QR (EMVCo)
 * รองรับเบอร์โทรศัพท์ (10 หลัก) และเลขบัตรประชาชน (13 หลัก)
 */
export function buildPromptPayPayload(promptpayId: string, amount: number) {
  const digits = promptpayId.replace(/\D/g, "");
  if (!digits) return "";

  const target =
    digits.length >= 13
      ? field("02", digits.slice(0, 13))
      : field("01", `0066${digits.replace(/^0/, "")}`);

  const merchantAccount = field("00", "A000000677010111") + target;

  const payload =
    field("00", "01") +
    field("01", amount > 0 ? "12" : "11") +
    field("29", merchantAccount) +
    field("53", "764") +
    (amount > 0 ? field("54", amount.toFixed(2)) : "") +
    field("58", "TH") +
    "6304";

  return payload + crc16(payload);
}
