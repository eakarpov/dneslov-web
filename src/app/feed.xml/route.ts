import { getDayMemories } from "../api";
import { resolveDay } from "../day/resolve";
import { churchToday, formatCivilISO } from "../../lib/dates/civil";
import { buildFeed, FeedEntry } from "../../lib/feed";
import { plainText } from "../../lib/markdown";
import { memoryHref } from "../../lib/routes";
import { SITE_URL } from "../../lib/site";

// Rebuilt every hour; the day it covers changes in the evening, like the
// church day itself.
export const revalidate = 3600;

export async function GET() {
    const date = churchToday();
    const { filters } = await resolveDay(date, "", null);
    const { data } = await getDayMemories(filters);

    const day = formatCivilISO(date);

    const entries: FeedEntry[] = (data?.list ?? [])
        .filter((item) => item.title && item.slug)
        .map((item) => ({
            // A tag URI, so the same memory commemorated next year is a new
            // entry rather than an edit of this one.
            id: `tag:dneslov.org,${day}:${item.slug}`,
            title: [Object.values(item.orders ?? {})[0], item.title].filter(Boolean).join(" "),
            url: `${SITE_URL}${memoryHref(item.slug!)}`,
            summary: plainText(item.note) || undefined,
        }));

    return new Response(
        buildFeed({
            siteUrl: SITE_URL,
            selfUrl: `${SITE_URL}/feed.xml`,
            date,
            entries,
        }),
        { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } },
    );
}
