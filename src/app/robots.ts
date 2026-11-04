import type { MetadataRoute } from "next";

function baseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/account",
        "/bookings",
        "/provider",
        "/reset-password",
        "/forgot-password",
        "/auth",
      ],
    },
    sitemap: `${baseUrl()}/sitemap.xml`,
  };
}
