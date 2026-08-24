import { describe, expect, it } from "vitest";
import { buildListHref, dayCalendarHref, dayHref, eventHref, memoryHref } from "./routes";
import { IDayFilters } from "./api/day";

const DEFAULTS = ["рпц", "днес", "стих"];
const date = { year: 2026, month: 8, day: 24 };

const filters = (patch: Partial<IDayFilters> = {}): IDayFilters => ({
    date,
    calendaries: DEFAULTS,
    query: "",
    ...patch,
});

describe("buildListHref", () => {
    it("leaves the default selection out of the address", () => {
        // One canonical address per day: the default must not appear as a param.
        expect(buildListHref(filters(), DEFAULTS)).toBe("/day/2026-08-24");
    });

    it("ignores the order of the selection when comparing to the default", () => {
        expect(buildListHref(filters({ calendaries: ["стих", "рпц", "днес"] }), DEFAULTS)).toBe(
            "/day/2026-08-24",
        );
    });

    it("writes a narrowed selection into the address", () => {
        expect(buildListHref(filters({ calendaries: ["рпц"] }), DEFAULTS)).toBe(
            "/day/2026-08-24?c=%D1%80%D0%BF%D1%86",
        );
    });

    it("carries the query", () => {
        const href = buildListHref(filters({ query: "икона / пётр" }), DEFAULTS);

        // Spaces come out as "+", which is what URLSearchParams produces and
        // what any query parser — including the one behind searchParams — reads
        // back as a space.
        expect(href).toBe("/day/2026-08-24?q=%D0%B8%D0%BA%D0%BE%D0%BD%D0%B0+%2F+%D0%BF%D1%91%D1%82%D1%80");
        expect(new URLSearchParams(href.split("?")[1]).get("q")).toBe("икона / пётр");
    });

    it("falls back to the dateless list when the date is dropped", () => {
        expect(buildListHref(filters({ date: null, query: "икона" }), DEFAULTS)).toBe(
            "/search?q=%D0%B8%D0%BA%D0%BE%D0%BD%D0%B0",
        );
    });
});

describe("dayCalendarHref", () => {
    it("offers the same day under the same filters", () => {
        expect(dayCalendarHref(filters(), DEFAULTS)).toBe("/day/2026-08-24/calendar.ics");
        expect(dayCalendarHref(filters({ calendaries: ["рпц"] }), DEFAULTS)).toBe(
            "/day/2026-08-24/calendar.ics?c=%D1%80%D0%BF%D1%86",
        );
    });

    it("has nothing to offer without a day", () => {
        expect(dayCalendarHref(filters({ date: null }), DEFAULTS)).toBeNull();
    });
});

describe("memory addresses", () => {
    it("does not pre-encode the slug", () => {
        // next/link and the metadata layer encode the path themselves; encoding
        // here produced double-encoded canonical URLs (%25D1%2581...).
        expect(memoryHref("спас")).toBe("/memory/спас");
        expect(eventHref("спас", 11545)).toBe("/memory/спас/11545");
    });

    it("builds a day address from parts", () => {
        expect(dayHref(date)).toBe("/day/2026-08-24");
    });
});
