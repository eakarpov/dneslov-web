import { describe, expect, it } from "vitest";
import { slugChipHue } from "./colors";

describe("slugChipHue", () => {
    it("gives the same slug the same hue every time", () => {
        expect(slugChipHue("рпц")).toEqual(slugChipHue("рпц"));
    });

    it("gives different slugs different hues", () => {
        expect(slugChipHue("рпц")).not.toEqual(slugChipHue("днес"));
    });

    it("stays inside the colour wheel", () => {
        for (const slug of ["рпц", "днес", "стих", "апп", "сщмч", "собор", "прп"]) {
            const hue = Number(slugChipHue(slug)!["--chip-h"]);

            expect(hue).toBeGreaterThanOrEqual(0);
            expect(hue).toBeLessThan(360);
            expect(Number.isInteger(hue)).toBe(true);
        }
    });

    it("decides only the hue, leaving lightness to the theme", () => {
        // This is what lets one chip work on a light and on a dark screen.
        expect(Object.keys(slugChipHue("рпц")!)).toEqual(["--chip-h"]);
    });

    it("has no colour for nothing", () => {
        expect(slugChipHue(undefined)).toBeUndefined();
        expect(slugChipHue("")).toBeUndefined();
    });
});
