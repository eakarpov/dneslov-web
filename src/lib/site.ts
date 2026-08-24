// Absolute origin of this deployment. Canonical links, the sitemap and the
// social card all need it, and none of them can be built from a relative path.
export const SITE_URL = (process.env.SITE_URL || "https://dneslov.org").replace(/\/$/, "");
