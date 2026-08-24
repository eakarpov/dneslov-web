import { DateParts, formatCivilISO, formatHuman } from "./dates/civil";

// A feed of the day, which the monolith does not offer in any form.
// Atom rather than RSS: its dates are plain ISO instead of RFC 822, so there is
// no locale-dependent month abbreviation to get wrong.

export const escapeXml = (value: string): string =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

export interface FeedEntry {
    id: string;
    title: string;
    url: string;
    summary?: string;
}

export interface FeedOptions {
    siteUrl: string;
    selfUrl: string;
    date: DateParts;
    entries: FeedEntry[];
    updated?: Date;
}

export const buildFeed = ({ siteUrl, selfUrl, date, entries, updated = new Date() }: FeedOptions): string => {
    const stamp = updated.toISOString().replace(/\.\d{3}Z$/, "Z");
    const dayUrl = `${siteUrl}/day/${formatCivilISO(date)}`;

    const items = entries
        .map((entry) =>
            [
                "  <entry>",
                `    <title>${escapeXml(entry.title)}</title>`,
                `    <link href="${escapeXml(entry.url)}"/>`,
                `    <id>${escapeXml(entry.id)}</id>`,
                `    <updated>${stamp}</updated>`,
                entry.summary ? `    <summary>${escapeXml(entry.summary)}</summary>` : null,
                "  </entry>",
            ]
                .filter(Boolean)
                .join("\n"),
        )
        .join("\n");

    return [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="ru">',
        `  <title>Днеслов — памяти на ${escapeXml(formatHuman(date))}</title>`,
        `  <link href="${escapeXml(dayUrl)}"/>`,
        `  <link rel="self" href="${escapeXml(selfUrl)}"/>`,
        `  <id>${escapeXml(dayUrl)}</id>`,
        `  <updated>${stamp}</updated>`,
        items,
        "</feed>",
        "",
    ]
        .filter((line) => line !== "")
        .join("\n");
};
