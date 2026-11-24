import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { Suspense } from "react";
import { AuthErrorNotice } from "@/components/auth-error-notice";
import { BottomNav } from "@/components/bottom-nav";
import { PwaRegister } from "@/components/pwa-register";
import { SiteHeader } from "@/components/site-header";
import { getAuthContext } from "@/lib/data";
import "./globals.css";

const notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-noto-thai",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "FastHelp — เรียกช่างและบริการถึงบ้าน",
    template: "%s | FastHelp",
  },
  description:
    "เรียกช่างและบริการถึงบ้าน ล้างแอร์ ทำความสะอาด เปลี่ยนแบตเตอรี่ ซ่อมไฟฟ้า และอีกมากมาย",
  applicationName: "FastHelp",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FastHelp",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthContext();

  return (
    <html
      lang="th"
      className={`${notoThai.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <div className="relative flex min-h-dvh w-full flex-col">
          <Suspense fallback={null}>
            <AuthErrorNotice />
          </Suspense>
          <SiteHeader auth={auth} />
          <main className="flex-1 pb-28 md:pb-10">{children}</main>
          <BottomNav role={auth?.profile?.role} />
        </div>
        <PwaRegister />
      </body>
    </html>
  );
}
