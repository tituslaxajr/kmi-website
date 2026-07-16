import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.KMI_SITE_URL || "https://www.kapatidministry.org";
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }], sitemap: `${base}/sitemap.xml` };
}
