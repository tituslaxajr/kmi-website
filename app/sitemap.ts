import type { MetadataRoute } from "next";
import { getPublishedChurches, getPublishedNeeds, getPublishedPrayerRequests, getPublishedStories, getPublishedUpdates } from "./lib/content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.KMI_SITE_URL || "https://www.kapatidministry.org";
  const staticPaths = ["", "/about", "/our-work", "/active-needs", "/field-updates", "/stories", "/prayer", "/partner-churches", "/give", "/contact", "/process-of-faithfulness"];
  const [needs, updates, stories, prayers, churches] = await Promise.all([getPublishedNeeds(), getPublishedUpdates(), getPublishedStories(), getPublishedPrayerRequests(), getPublishedChurches()]);
  const dynamicPaths = [
    ...needs.map((item) => `/active-needs/${item.slug}`),
    ...updates.map((item) => `/field-updates/${item.slug}`),
    ...stories.map((item) => `/stories/${item.slug}`),
    ...prayers.map((item) => `/prayer/${item.slug}`),
    ...churches.map((item) => `/partner-churches/${item.slug}`),
  ];
  return [...new Set([...staticPaths, ...dynamicPaths])].map((path) => ({ url: `${base}${path}`, changeFrequency: path ? "weekly" : "daily" }));
}
