import { describe, expect, it } from "vitest";
import { memoryTypeLabel } from "./memoryTypes";

describe("memoryTypeLabel", () => {
    it("names what a memory is when it is not a person", () => {
        expect(memoryTypeLabel("Place")).toBe("место");
        expect(memoryTypeLabel("Council")).toBe("собор");
        expect(memoryTypeLabel("Thing")).toBe("предмет");
    });

    it("says nothing for a person", () => {
        // Almost every memory is one; labelling each would be noise.
        expect(memoryTypeLabel("Identity")).toBeUndefined();
    });

    it("says nothing for a type it does not know or for none at all", () => {
        expect(memoryTypeLabel("Newfangled")).toBeUndefined();
        expect(memoryTypeLabel(undefined)).toBeUndefined();
        expect(memoryTypeLabel("")).toBeUndefined();
    });
});
