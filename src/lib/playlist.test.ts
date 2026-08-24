import { describe, expect, it } from "vitest";
import { mapWithLimit, tracksOfMemory } from "./playlist";
import { IMemory } from "../dto/memory";

const memory = (patch: Partial<IMemory> = {}) =>
    ({ id: 1, slug: "кама", short_name: "Пётр и Павел", ...patch }) as IMemory;

describe("tracksOfMemory", () => {
    it("takes the chants that actually have audio", () => {
        const tracks = tracksOfMemory(
            memory({
                scripta: [
                    { type: "Troparion", text: "", audio_url: "https://x/1.mp3", tone: 4 },
                    { type: "Kontakion", text: "" },
                ],
            }),
        );

        expect(tracks).toHaveLength(1);
        expect(tracks[0].url).toBe("https://x/1.mp3");
        expect(tracks[0].title).toBe("Тропарь, глас 4-й");
        expect(tracks[0].memoryTitle).toBe("Пётр и Павел");
    });

    it("also takes the chants hanging off events", () => {
        const tracks = tracksOfMemory(
            memory({
                scripta: [{ type: "Troparion", text: "", audio_url: "https://x/1.mp3" }],
                events: [
                    { scripta: [{ type: "Kontakion", text: "", audio_url: "https://x/2.mp3" }] },
                ] as unknown as IMemory["events"],
            }),
        );

        expect(tracks.map((t) => t.url)).toEqual(["https://x/1.mp3", "https://x/2.mp3"]);
    });

    it("does not play the same file twice", () => {
        // The same chant is often attached both to the memory and to its event.
        const tracks = tracksOfMemory(
            memory({
                scripta: [{ type: "Troparion", text: "", audio_url: "https://x/1.mp3" }],
                events: [
                    { scripta: [{ type: "Troparion", text: "", audio_url: "https://x/1.mp3" }] },
                ] as unknown as IMemory["events"],
            }),
        );

        expect(tracks).toHaveLength(1);
    });

    it("finds nothing in a memory without chants", () => {
        expect(tracksOfMemory(memory())).toEqual([]);
    });
});

describe("mapWithLimit", () => {
    it("keeps the order of the results", async () => {
        const out = await mapWithLimit([1, 2, 3, 4, 5], 2, async (n) => n * 10);
        expect(out).toEqual([10, 20, 30, 40, 50]);
    });

    it("never runs more than the limit at once", async () => {
        let running = 0;
        let peak = 0;

        await mapWithLimit(Array.from({ length: 12 }, (_, i) => i), 3, async () => {
            running += 1;
            peak = Math.max(peak, running);
            await new Promise((resolve) => setTimeout(resolve, 5));
            running -= 1;
            return null;
        });

        expect(peak).toBeLessThanOrEqual(3);
    });

    it("copes with an empty list", async () => {
        expect(await mapWithLimit([], 4, async () => 1)).toEqual([]);
    });
});
