import { describe, expect, it } from "vitest";
import { compareDays } from "./compare";
import { IDayMemo } from "../dto/day";

const memo = (slug: string, title = slug): IDayMemo => ({ slug, title });

describe("compareDays", () => {
    it("splits the day into what each calendary keeps alone and what both keep", () => {
        const result = compareDays(
            [memo("спас"), memo("кама"), memo("бдче")],
            [memo("кама"), memo("гвгрд")],
        );

        expect(result.onlyA.map((m) => m.slug)).toEqual(["спас", "бдче"]);
        expect(result.both.map((m) => m.slug)).toEqual(["кама"]);
        expect(result.onlyB.map((m) => m.slug)).toEqual(["гвгрд"]);
    });

    it("handles one side being empty", () => {
        const result = compareDays([memo("спас")], []);

        expect(result.onlyA.map((m) => m.slug)).toEqual(["спас"]);
        expect(result.both).toEqual([]);
        expect(result.onlyB).toEqual([]);
    });

    it("handles both sides being empty", () => {
        expect(compareDays([], [])).toEqual({ onlyA: [], onlyB: [], both: [] });
    });

    it("falls back to the id when a row carries no slug", () => {
        const left = [{ id: 7, title: "без слага" }];
        const right = [{ id: 7, title: "без слага" }];

        expect(compareDays(left, right).both).toHaveLength(1);
    });

    it("keeps each side's own wording for a shared memory", () => {
        // The two calendaries can title the same memory differently.
        const result = compareDays(
            [memo("кама", "Пётр и Павел")],
            [memo("кама", "Первоверховные апостолы")],
        );

        expect(result.both[0].title).toBe("Пётр и Павел");
    });
});
