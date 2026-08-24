import { describe, expect, it } from "vitest";
import { formatQueryGroups, normalizeQuery, parseQueryGroups, removeQueryGroup } from "./search";

describe("parseQueryGroups", () => {
    it("splits OR groups on the slash", () => {
        expect(parseQueryGroups("икона/пётр")).toEqual(["икона", "пётр"]);
    });

    it("keeps AND words inside a group together", () => {
        expect(parseQueryGroups("икона пётр / павел")).toEqual(["икона пётр", "павел"]);
    });

    it("collapses stray whitespace", () => {
        expect(parseQueryGroups("  икона   пётр  ")).toEqual(["икона пётр"]);
    });

    it("drops empty groups", () => {
        expect(parseQueryGroups("икона //  / пётр")).toEqual(["икона", "пётр"]);
        expect(parseQueryGroups("   ")).toEqual([]);
        expect(parseQueryGroups("")).toEqual([]);
    });
});

describe("normalizeQuery", () => {
    it("spaces out slashes so chips and input agree", () => {
        expect(normalizeQuery("икона/пётр  апостол")).toBe("икона / пётр апостол");
    });

    it("is idempotent", () => {
        const once = normalizeQuery("икона/пётр");
        expect(normalizeQuery(once)).toBe(once);
    });
});

describe("removeQueryGroup", () => {
    it("removes the chosen group and keeps the rest", () => {
        // The monolith gets this backwards: its splice returns the *removed*
        // element, so taking off a chip leaves exactly that word behind.
        expect(removeQueryGroup("икона / пётр апостол", 0)).toBe("пётр апостол");
        expect(removeQueryGroup("икона / пётр апостол", 1)).toBe("икона");
    });

    it("leaves the query alone for an index that is not there", () => {
        expect(removeQueryGroup("икона / пётр", 5)).toBe("икона / пётр");
    });

    it("empties the query when the last group goes", () => {
        expect(removeQueryGroup("икона", 0)).toBe("");
    });
});

describe("formatQueryGroups", () => {
    it("round-trips with the parser", () => {
        const query = "икона пётр / павел / собор";
        expect(formatQueryGroups(parseQueryGroups(query))).toBe(query);
    });
});
