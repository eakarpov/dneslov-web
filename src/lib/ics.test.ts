import { describe, expect, it } from "vitest";
import { buildDayCalendar, foldLine, IcsEntry } from "./ics";

const date = { year: 2026, month: 8, day: 25 };
const now = new Date(Date.UTC(2026, 7, 25, 9, 30, 0));

const calendar = (
    entries: IcsEntry[] = [{ uid: "спас-2026-08-25@dneslov", summary: "Преображение" }],
) => buildDayCalendar(date, entries, now);

describe("buildDayCalendar", () => {
    it("wraps the events in a calendar", () => {
        const ics = calendar();

        expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
        expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
        expect(ics).toContain("VERSION:2.0");
    });

    it("uses CRLF, as the format requires", () => {
        expect(calendar().split("\r\n").length).toBeGreaterThan(5);
        expect(/[^\r]\n/.test(calendar())).toBe(false);
    });

    it("makes an all-day event ending on the next day", () => {
        // DTEND is exclusive, so a single day ends on the 26th.
        const ics = calendar();

        expect(ics).toContain("DTSTART;VALUE=DATE:20260825");
        expect(ics).toContain("DTEND;VALUE=DATE:20260826");
    });

    it("stamps the events", () => {
        expect(calendar()).toContain("DTSTAMP:20260825T093000Z");
    });

    it("escapes commas, semicolons and newlines in text", () => {
        const ics = calendar([
            {
                uid: "x@dneslov",
                summary: "Пётр, Павел; и другие",
                description: "первая строка\nвторая",
            },
        ]);

        // Both the comma and the semicolon must reach the file as escaped
        // sequences; "\\;" in JS source is one backslash plus a semicolon.
        expect(ics).toContain("SUMMARY:Пётр\\, Павел\\; и другие");
        expect(ics).toContain("DESCRIPTION:первая строка\\nвторая");
    });

    it("survives a day with nothing in it", () => {
        const ics = buildDayCalendar(date, [], now);

        expect(ics).toContain("BEGIN:VCALENDAR");
        expect(ics).not.toContain("BEGIN:VEVENT");
    });
});

describe("foldLine", () => {
    it("leaves a short line alone", () => {
        expect(foldLine("SUMMARY:коротко")).toBe("SUMMARY:коротко");
    });

    it("folds by octets, not characters", () => {
        // Cyrillic is two bytes a letter, so a 60-character line is already
        // over the 75-octet limit.
        const folded = foldLine(`SUMMARY:${"я".repeat(60)}`);

        expect(folded).toContain("\r\n ");
        for (const line of folded.split("\r\n")) {
            expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
        }
    });

    it("keeps the content when unfolded again", () => {
        const line = `DESCRIPTION:${"слово ".repeat(30)}`;
        expect(foldLine(line).split("\r\n ").join("")).toBe(line);
    });
});
