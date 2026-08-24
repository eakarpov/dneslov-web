import { describe, expect, it } from "vitest";
import { buildFeed, escapeXml, FeedEntry } from "./feed";

const date = { year: 2026, month: 8, day: 25 };
const updated = new Date(Date.UTC(2026, 7, 25, 9, 30, 0));

const feed = (entries: FeedEntry[] = []) =>
    buildFeed({
        siteUrl: "https://dneslov.org",
        selfUrl: "https://dneslov.org/feed.xml",
        date,
        entries,
        updated,
    });

describe("escapeXml", () => {
    it("escapes everything that would break the document", () => {
        expect(escapeXml(`<a href="x">&'`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&apos;");
    });
});

describe("buildFeed", () => {
    it("declares itself as Atom", () => {
        const xml = feed();

        expect(xml.startsWith('<?xml version="1.0" encoding="utf-8"?>')).toBe(true);
        expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom"');
        expect(xml.trimEnd().endsWith("</feed>")).toBe(true);
    });

    it("names the day it covers and points back at it", () => {
        const xml = feed();

        expect(xml).toContain("<title>Днеслов — памяти на 25 августа 2026</title>");
        expect(xml).toContain('<link href="https://dneslov.org/day/2026-08-25"/>');
        expect(xml).toContain('<link rel="self" href="https://dneslov.org/feed.xml"/>');
    });

    it("uses plain ISO timestamps", () => {
        expect(feed()).toContain("<updated>2026-08-25T09:30:00Z</updated>");
    });

    it("writes an entry per memory", () => {
        const xml = feed([
            {
                id: "tag:dneslov.org,2026-08-25:спас",
                title: "апп Варфоломей и Тит",
                url: "https://dneslov.org/memory/спас",
                summary: "Примечание",
            },
        ]);

        expect(xml).toContain("<title>апп Варфоломей и Тит</title>");
        expect(xml).toContain("<id>tag:dneslov.org,2026-08-25:спас</id>");
        expect(xml).toContain("<summary>Примечание</summary>");
    });

    it("leaves the summary out when there is none", () => {
        const xml = feed([{ id: "x", title: "Без примечания", url: "https://dneslov.org/memory/x" }]);

        expect(xml).not.toContain("<summary>");
    });

    it("escapes entry text rather than letting it into the markup", () => {
        const xml = feed([
            { id: "x", title: 'Пётр & Павел <b>"первоверховные"</b>', url: "https://dneslov.org/x" },
        ]);

        expect(xml).not.toContain("<b>");
        expect(xml).toContain("&amp;");
        expect(xml).toContain("&lt;b&gt;");
    });

    it("survives a day with nothing in it", () => {
        expect(feed()).not.toContain("<entry>");
    });
});
