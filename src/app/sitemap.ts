import type { MetadataRoute } from "next";
import { getPublicConfig } from "@/lib/public-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const config = getPublicConfig();
  return [{ url: config.siteUrl.replace(/\/$/, ""), changeFrequency: "weekly", priority: 1 }];
}
