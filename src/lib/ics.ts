import { DateParts, addDays, formatCivilISO } from "./dates/civil";

// A day's memories as a calendar file, so the reference can live in whatever
// calendar the reader already uses. The monolith offers nothing of the sort.

const escapeText = (value: string): string =>
    value
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\r?\n/g, "\\n");

// RFC 5545 wants lines folded at 75 octets, continued with a leading space.
// Cyrillic is two bytes per character, so folding has to count octets.
export const foldLine = (line: string): string => {
    const encoder = new TextEncoder();
    if (encoder.encode(line).length <= 75) return line;

    const parts: string[] = [];
    let current = "";
    let currentBytes = 0;
    let limit = 75;

    for (const char of line) {
        const size = encoder.encode(char).length;

        if (currentBytes + size > limit) {
            parts.push(current);
            current = "";
            currentBytes = 0;
            // Continuation lines carry a leading space that counts toward the limit.
            limit = 74;
        }

        current += char;
        currentBytes += size;
    }

    parts.push(current);

    return parts.join("\r\n ");
};

const asDateValue = (date: DateParts): string => formatCivilISO(date).replace(/-/g, "");

const stamp = (now: Date): string => `${now.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;

export interface IcsEntry {
    uid: string;
    summary: string;
    description?: string;
    url?: string;
}

export const buildDayCalendar = (
    date: DateParts,
    entries: IcsEntry[],
    now: Date = new Date(),
): string => {
    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//dneslov//calendar//RU",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
    ];

    for (const entry of entries) {
        lines.push(
            "BEGIN:VEVENT",
            `UID:${entry.uid}`,
            `DTSTAMP:${stamp(now)}`,
            // All-day event: DTEND is exclusive, so it is the next day.
            `DTSTART;VALUE=DATE:${asDateValue(date)}`,
            `DTEND;VALUE=DATE:${asDateValue(addDays(date, 1))}`,
            `SUMMARY:${escapeText(entry.summary)}`,
        );

        if (entry.description) lines.push(`DESCRIPTION:${escapeText(entry.description)}`);
        if (entry.url) lines.push(`URL:${escapeText(entry.url)}`);

        lines.push("END:VEVENT");
    }

    lines.push("END:VCALENDAR");

    return `${lines.map(foldLine).join("\r\n")}\r\n`;
};
