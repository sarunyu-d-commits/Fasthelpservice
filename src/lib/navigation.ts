const AUTH_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

/** หน้าที่ไม่ควรแสดงแถบนำทางด้านล่าง (หน้าระบบยืนยันตัวตน) */
export function isAuthPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return AUTH_PATHS.has(normalized);
}
