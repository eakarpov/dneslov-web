import { describe, expect, it } from "vitest";
import { getDescribedMemoes, getExternalLinks, getHappenedAt, getOrder } from "./selectors";
import { IMemory } from "../../../dto/memory";

// A memory with no links, no events and no calendar entries: real responses
// omit those keys entirely rather than sending empty arrays, and the page used
// to crash on the first .filter().
const bare = { id: 1, slug: "свткрт", short_name: "святителей Критских", type: "Council" } as IMemory;

describe("selectors on a bare memory", () => {
    it("finds no external links instead of throwing", () => {
        expect(getExternalLinks(bare)).toEqual([]);
    });

    it("finds no order", () => {
        expect(getOrder(bare)).toBeUndefined();
    });

    it("finds no date", () => {
        expect(getHappenedAt(bare)).toBeUndefined();
    });

    it("finds no described entries", () => {
        expect(getDescribedMemoes(bare)).toEqual([]);
    });
});
