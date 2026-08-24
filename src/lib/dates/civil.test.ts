import { describe, expect, it } from "vitest";
import {
    addDays,
    churchToday,
    civilToJulian,
    formatCivilISO,
    formatHuman,
    julianGapDays,
    julianToCivil,
    parseCivilISO,
    toLegacyDateParam,
} from "./civil";

describe("parseCivilISO", () => {
    it("reads a well-formed date", () => {
        expect(parseCivilISO("2026-08-24")).toEqual({ year: 2026, month: 8, day: 24 });
    });

    it("rejects dates that do not exist", () => {
        // The whole point of validating: a bad segment must 404, never silently
        // roll over into another day.
        expect(parseCivilISO("2026-02-30")).toBeNull();
        expect(parseCivilISO("2025-02-29")).toBeNull();
        expect(parseCivilISO("2026-13-01")).toBeNull();
        expect(parseCivilISO("2026-00-10")).toBeNull();
    });

    it("accepts a real leap day", () => {
        expect(parseCivilISO("2024-02-29")).toEqual({ year: 2024, month: 2, day: 29 });
    });

    it("rejects anything that is not zero-padded ISO", () => {
        expect(parseCivilISO("2026-8-4")).toBeNull();
        expect(parseCivilISO("24.08.2026")).toBeNull();
        expect(parseCivilISO("26-08-24")).toBeNull();
        expect(parseCivilISO("")).toBeNull();
    });

    it("round-trips through formatCivilISO", () => {
        for (const iso of ["2026-08-24", "2000-01-01", "2100-03-01", "1999-12-31"]) {
            expect(formatCivilISO(parseCivilISO(iso)!)).toBe(iso);
        }
    });
});

describe("civil <-> julian", () => {
    it("matches the anchor everyone knows: Nativity", () => {
        // 7 January civil is 25 December old style.
        expect(civilToJulian({ year: 2026, month: 1, day: 7 })).toEqual({
            year: 2025,
            month: 12,
            day: 25,
        });
    });

    it("converts both ways", () => {
        expect(civilToJulian({ year: 2026, month: 8, day: 24 })).toEqual({
            year: 2026,
            month: 8,
            day: 11,
        });
        expect(julianToCivil({ year: 2026, month: 8, day: 11 })).toEqual({
            year: 2026,
            month: 8,
            day: 24,
        });
    });

    it("round-trips across century boundaries", () => {
        for (const parts of [
            { year: 1900, month: 3, day: 1 },
            { year: 2000, month: 2, day: 29 },
            { year: 2100, month: 3, day: 1 },
            { year: 2101, month: 1, day: 1 },
        ]) {
            expect(julianToCivil(civilToJulian(parts))).toEqual(parts);
        }
    });
});

describe("julianGapDays", () => {
    it("is 13 days in our century", () => {
        expect(julianGapDays({ year: 2026, month: 8, day: 24 })).toBe(13);
        expect(julianGapDays({ year: 1900, month: 3, day: 1 })).toBe(13);
        expect(julianGapDays({ year: 2100, month: 2, day: 28 })).toBe(13);
    });

    it("becomes 14 days from 1 March 2100", () => {
        // This is why the gap is computed and never hardcoded to 13.
        expect(julianGapDays({ year: 2100, month: 3, day: 1 })).toBe(14);
        expect(julianGapDays({ year: 2101, month: 1, day: 1 })).toBe(14);
    });
});

describe("churchToday", () => {
    it("keeps the current day before 15:00 local", () => {
        expect(churchToday(new Date(2026, 7, 24, 14, 59))).toEqual({
            year: 2026,
            month: 8,
            day: 24,
        });
    });

    it("moves to the next day from 15:00 local", () => {
        // The church day begins in the evening; the monolith shifts by +9h.
        expect(churchToday(new Date(2026, 7, 24, 15, 0))).toEqual({
            year: 2026,
            month: 8,
            day: 25,
        });
    });

    it("rolls over the year", () => {
        expect(churchToday(new Date(2026, 11, 31, 20, 0))).toEqual({
            year: 2027,
            month: 1,
            day: 1,
        });
    });
});

describe("addDays", () => {
    it("crosses months and years", () => {
        expect(addDays({ year: 2026, month: 8, day: 31 }, 1)).toEqual({
            year: 2026,
            month: 9,
            day: 1,
        });
        expect(addDays({ year: 2026, month: 1, day: 1 }, -1)).toEqual({
            year: 2025,
            month: 12,
            day: 31,
        });
    });

    it("handles a leap day", () => {
        expect(addDays({ year: 2024, month: 2, day: 28 }, 1)).toEqual({
            year: 2024,
            month: 2,
            day: 29,
        });
    });
});

describe("toLegacyDateParam", () => {
    it("always sends the new-Julian prefix with the civil date", () => {
        // We address days civilly, so the backend must read the number as
        // new-Julian; sending "ю" here would shift the query by 13 days.
        expect(toLegacyDateParam({ year: 2026, month: 8, day: 24 })).toBe("н24.08.2026");
        expect(toLegacyDateParam({ year: 2026, month: 1, day: 7 })).toBe("н07.01.2026");
    });
});

describe("formatHuman", () => {
    it("uses the genitive month", () => {
        expect(formatHuman({ year: 2026, month: 8, day: 24 })).toBe("24 августа 2026");
        expect(formatHuman({ year: 2026, month: 5, day: 1 })).toBe("1 мая 2026");
    });
});
