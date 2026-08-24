import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";
import { addDays, churchToday, formatCivilISO } from "../lib/dates/civil";

// Regenerated daily. The monolith ships a static sitemap regenerated every few
// months, and its /sitemap.xml route answers 404 outright.
export const revalidate = 86400;

// A year back and a year forward: every day of the church year gets its own
// indexable address, which the monolith has no equivalent of at all.
const DAYS_BACK = 365;
const DAYS_AHEAD = 365;

export default function sitemap(): MetadataRoute.Sitemap {
    const today = churchToday();

    const statics: MetadataRoute.Sitemap = [
        { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
        { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.3 },
        { url: `${SITE_URL}/gallery`, changeFrequency: "weekly", priority: 0.5 },
        { url: `${SITE_URL}/rites`, changeFrequency: "monthly", priority: 0.3 },
    ];

    const days: MetadataRoute.Sitemap = Array.from(
        { length: DAYS_BACK + DAYS_AHEAD + 1 },
        (_, index) => {
            const date = addDays(today, index - DAYS_BACK);

            return {
                url: `${SITE_URL}/day/${formatCivilISO(date)}`,
                changeFrequency: "yearly" as const,
                priority: 0.6,
            };
        },
    );

    // TODO memories: enumerating every slug means paging the whole legacy index,
    // which is too much to ask of a backend that answers a third of the time.
    return [...statics, ...days];
}
